import "server-only";

/** Settings the starter reads on the server. None of them ever reach the browser. */
export interface LoyaltyConfig {
  apiUrl: string;
  apiKey: string;
  /** Stands in for your signed-in shopper. Replace it with your own session lookup. */
  demoCustomerExternalId: string;
}

export const LOYALTY_VARS = [
  "LOOM_LOYALTY_API_URL",
  "LOOM_LOYALTY_API_KEY",
  "LOOM_LOYALTY_DEMO_CUSTOMER_EXTERNAL_ID",
] as const;

const value = (name: string) => process.env[name]?.trim() ?? "";

/** The Loom Loyalty settings, or the names of the ones that are missing. */
export function loyaltyConfig(): { config: LoyaltyConfig } | { missing: string[] } {
  const missing = LOYALTY_VARS.filter((name) => !value(name));
  if (missing.length > 0) return { missing };
  return {
    config: {
      apiUrl: value("LOOM_LOYALTY_API_URL"),
      apiKey: value("LOOM_LOYALTY_API_KEY"),
      demoCustomerExternalId: value("LOOM_LOYALTY_DEMO_CUSTOMER_EXTERNAL_ID"),
    },
  };
}

/** The model the assistant uses, through Vercel AI Gateway. */
export const MODEL = value("AI_MODEL") || "anthropic/claude-haiku-5.5";

/**
 * Whether the app can reach AI Gateway. On Vercel, deployments authenticate with OIDC and need no
 * key; elsewhere set AI_GATEWAY_API_KEY.
 */
export function hasModelAccess(): boolean {
  return Boolean(value("AI_GATEWAY_API_KEY") || value("VERCEL_OIDC_TOKEN") || value("VERCEL"));
}
