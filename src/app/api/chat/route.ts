import { convertToModelMessages, isStepCount, streamText, type UIMessage } from "ai";

import { hasModelAccess, loyaltyConfig, MODEL } from "@/lib/config";
import { toolsFor } from "@/lib/member";
import { allow, clientIp } from "@/lib/rate-limit";

export const maxDuration = 30;

/** Caps that keep a public demo cheap: history kept, characters, and tokens per reply step. */
const MAX_MESSAGES = 20;
const MAX_CHARS = 1_000;
const MAX_TOTAL_CHARS = 6_000;
const MAX_OUTPUT_TOKENS = 400;

const SYSTEM = `You are the shopping assistant for this store's loyalty program.
Answer questions about the shopper's points, tier and offers with the loyalty tools; never guess numbers.
Keep answers short and friendly, in plain text without Markdown. If a tool returns an error, explain it in plain words.
You can't change points, tiers or offers, and you can only see the signed-in shopper's own account.`;

export async function POST(req: Request) {
  if (!allow(clientIp(req.headers))) {
    return Response.json(
      { error: "Too many messages. Wait a minute and try again." },
      { status: 429 }
    );
  }

  const loyalty = loyaltyConfig();
  if ("missing" in loyalty || !hasModelAccess()) {
    return Response.json({ error: "The assistant isn't set up yet." }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as { messages?: UIMessage[] } | null;
  if (!Array.isArray(body?.messages)) {
    return Response.json({ error: "Send { messages }." }, { status: 400 });
  }
  // Keep only what a shopper types and the assistant's text: no client-sent system messages,
  // files or tool parts, so a caller can't replace the instructions or run up the model bill.
  let budget = MAX_TOTAL_CHARS;
  const messages: UIMessage[] = [];
  for (const message of body.messages.slice(-MAX_MESSAGES).reverse()) {
    if (message?.role !== "user" && message?.role !== "assistant") continue;
    const text = (Array.isArray(message.parts) ? message.parts : [])
      .map((part) => (part?.type === "text" && typeof part.text === "string" ? part.text : ""))
      .join("")
      .slice(0, Math.min(MAX_CHARS, budget));
    if (!text) continue;
    budget -= text.length;
    messages.unshift({ id: String(message.id ?? ""), role: message.role, parts: [{ type: "text", text }] });
    if (budget <= 0) break;
  }
  if (messages.at(-1)?.role !== "user") {
    return Response.json({ error: "Send a message." }, { status: 400 });
  }

  // In your app, use the shopper your session has signed in. Never take this id from the request.
  const tools = toolsFor(loyalty.config, loyalty.config.demoCustomerExternalId);

  const result = streamText({
    model: MODEL,
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: isStepCount(4),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    abortSignal: req.signal,
  });
  return result.toUIMessageStreamResponse({
    // Shown in the chat. The usual cause on a new Vercel project is AI Gateway not being set up.
    onError: () =>
      "The assistant couldn't reach its AI model. Check that AI Gateway is enabled for this Vercel team (or AI_GATEWAY_API_KEY is set), then try again.",
  });
}
