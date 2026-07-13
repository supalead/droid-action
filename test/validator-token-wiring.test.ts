import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const action = readFileSync(join(import.meta.dir, "..", "action.yml"), "utf8");

describe("validator token wiring", () => {
  test("reuses the effective token without a second OIDC exchange", () => {
    const prepareValidatorStep = action.match(
      /- name: Prepare validator[\s\S]*?(?=\n    - name:)/,
    )?.[0];

    expect(prepareValidatorStep).toBeDefined();
    expect(prepareValidatorStep).toContain(
      "OVERRIDE_GITHUB_TOKEN: ${{ steps.prepare.outputs.github_token }}",
    );
  });

  test("threads review delivery through both prepare passes", () => {
    expect(action).toContain("review_delivery:");
    expect(action).toMatch(/review_delivery:[\s\S]*?default: "direct"/);
    const prepareStep = action.match(
      /- name: Prepare action[\s\S]*?(?=\n    - name:)/,
    )?.[0];
    const prepareValidatorStep = action.match(
      /- name: Prepare validator[\s\S]*?(?=\n    - name:)/,
    )?.[0];

    expect(prepareStep).toContain(
      "REVIEW_DELIVERY: ${{ inputs.review_delivery }}",
    );
    expect(prepareValidatorStep).toContain(
      "REVIEW_DELIVERY: ${{ inputs.review_delivery }}",
    );
  });
});
