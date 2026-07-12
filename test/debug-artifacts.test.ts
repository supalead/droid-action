import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const action = readFileSync(join(import.meta.dir, "..", "action.yml"), "utf8");

describe("debug artifact safety", () => {
  test("debug artifact upload is opt-in and guards collection plus upload", () => {
    expect(action).toMatch(
      /upload_debug_artifacts:[\s\S]*?required:\s*false[\s\S]*?default:\s*"false"/,
    );

    const guardedSteps =
      action.match(/inputs\.upload_debug_artifacts\s*==\s*['"]true['"]/g) ?? [];
    expect(guardedSteps).toHaveLength(2);
  });
});
