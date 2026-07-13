export const REVIEW_DELIVERY_MODES = ["direct", "artifact-only"] as const;

export type ReviewDelivery = (typeof REVIEW_DELIVERY_MODES)[number];

export function parseReviewDelivery(value?: string): ReviewDelivery {
  const normalized = value?.trim() || "direct";

  if (normalized === "direct" || normalized === "artifact-only") {
    return normalized;
  }

  throw new Error(
    `Unsupported review_delivery '${normalized}'. Expected 'direct' or 'artifact-only'.`,
  );
}

export function isArtifactOnlyDelivery(delivery: ReviewDelivery): boolean {
  return delivery === "artifact-only";
}
