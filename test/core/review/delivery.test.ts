import { describe, expect, it } from "bun:test";
import { parseReviewDelivery } from "../../../src/core/review/delivery";

describe("parseReviewDelivery", () => {
  it("defaults to backward-compatible direct delivery", () => {
    expect(parseReviewDelivery(undefined)).toBe("direct");
    expect(parseReviewDelivery("")).toBe("direct");
  });

  it("accepts artifact-only delivery", () => {
    expect(parseReviewDelivery("artifact-only")).toBe("artifact-only");
  });

  it("rejects unknown delivery modes", () => {
    expect(() => parseReviewDelivery("app-token")).toThrow(
      "Unsupported review_delivery",
    );
  });
});
