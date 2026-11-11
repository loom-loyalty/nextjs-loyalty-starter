"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

const SUGGESTIONS = ["How many points do I have?", "What tier am I?", "Do I have any coupons?"];

export function Chat() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");
  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    void sendMessage({ text });
    setInput("");
  };

  return (
    <section aria-labelledby="assistant-title" className="flex flex-col gap-4">
      <h1 id="assistant-title" className="text-2xl font-semibold">
        Ask the assistant
      </h1>

      <div aria-live="polite" className="space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="min-h-11 rounded-full border border-border bg-surface px-4 text-sm hover:border-accent focus-visible:outline-2 focus-visible:outline-accent"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        {messages.map((m) => {
          const text = m.parts
            .map((part) => (part.type === "text" ? part.text : ""))
            .join("")
            .trim();
          if (!text) return null;
          return (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[80%] rounded-lg bg-accent px-4 py-2 text-accent-foreground"
                  : "max-w-[80%] rounded-lg border border-border bg-surface px-4 py-2"
              }
            >
              <span className="sr-only">{m.role === "user" ? "You: " : "Assistant: "}</span>
              <p className="whitespace-pre-wrap">{text}</p>
            </div>
          );
        })}

        {busy ? <p className="text-sm text-muted">Checking your account…</p> : null}
        {error ? (
          <p role="alert" className="text-sm">
            {errorText(error)}
          </p>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <input
          id="message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          placeholder="Ask about your points, tier or offers"
          className="min-h-11 flex-1 rounded-lg border border-border bg-surface px-3 focus-visible:outline-2 focus-visible:outline-accent"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="min-h-11 rounded-lg bg-accent px-5 font-medium text-accent-foreground disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Send
        </button>
      </form>
    </section>
  );
}

/** The route answers errors as JSON ({ error }) or as a stream error with plain text. */
function errorText(error: Error): string {
  const fallback = "The assistant couldn't answer. Try again in a minute.";
  try {
    const parsed = JSON.parse(error.message) as { error?: unknown };
    return typeof parsed.error === "string" ? parsed.error : fallback;
  } catch {
    return error.message || fallback;
  }
}
