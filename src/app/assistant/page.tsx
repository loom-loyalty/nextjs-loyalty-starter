import { connection } from "next/server";
import { Suspense } from "react";

import { Setup } from "@/components/setup";
import { hasModelAccess, loyaltyConfig } from "@/lib/config";

import { Chat } from "./chat";

export const metadata = { title: "Ask the assistant" };

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="h-96 rounded-lg border border-border bg-surface" />}>
      <Assistant />
    </Suspense>
  );
}

async function Assistant() {
  await connection();
  const loyalty = loyaltyConfig();
  const missing = "missing" in loyalty ? [...loyalty.missing] : [];
  if (!hasModelAccess()) missing.push("AI_GATEWAY_API_KEY");
  if (missing.length > 0) return <Setup title="Set up the assistant" missing={missing} />;
  return <Chat />;
}
