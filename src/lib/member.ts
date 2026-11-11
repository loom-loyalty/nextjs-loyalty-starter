import "server-only";

import {
  memberTools,
  type OffersResult,
  type PointsResult,
  type TierResult,
  type ToolError,
} from "@loom-loyalty/ai-sdk";

import type { LoyaltyConfig } from "./config";

export interface MemberSummary {
  points: PointsResult | ToolError;
  tier: TierResult | ToolError;
  offers: OffersResult | ToolError;
}

/**
 * Tools bound to one shopper. Pass the id of the shopper your app has signed in; the model can't
 * change it.
 */
export function toolsFor(config: LoyaltyConfig, customerExternalId: string) {
  return memberTools({ customerExternalId, apiUrl: config.apiUrl, apiKey: config.apiKey });
}

/** The member page reads through the same tools the assistant uses, so both show the same data. */
export async function memberSummary(config: LoyaltyConfig): Promise<MemberSummary> {
  const tools = toolsFor(config, config.demoCustomerExternalId);
  const options = { toolCallId: "member-page", messages: [], context: {} };
  const [points, tier, offers] = await Promise.all([
    tools.getMyPoints.execute!({}, options),
    tools.getMyTier.execute!({}, options),
    tools.getMyOffers.execute!({}, options),
  ]);
  return {
    points: points as PointsResult | ToolError,
    tier: tier as TierResult | ToolError,
    offers: offers as OffersResult | ToolError,
  };
}

export const isError = (value: object): value is ToolError => "error" in value;
