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
});
