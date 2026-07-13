import { describe, expect, it } from "bun:test";
import {
  normalizeDroidArgs,
  parseAllowedTools,
  stripAllowedToolsArg,
} from "../../src/utils/parse-tools";

describe("review tool argument handling", () => {
  it("parses and removes a normalized enabled-tools argument", () => {
    const normalized = normalizeDroidArgs(
      '--allowed-tools "Read,github_pr___submit_review" --model custom',
    );

    expect(parseAllowedTools(normalized)).toEqual([
      "Read",
      "github_pr___submit_review",
    ]);
    expect(stripAllowedToolsArg(normalized)).toBe("--model custom");
  });

  it("removes every enabled-tools occurrence", () => {
    expect(
      stripAllowedToolsArg(
        "--enabled-tools Read --enabled-tools 'github_comment___update_droid_comment' --tag review",
      ),
    ).toBe("--tag review");
  });

  it("handles equals-form enabled-tools arguments", () => {
    const normalized = normalizeDroidArgs(
      "--enabledTools=github_pr___submit_review --model custom",
    );
    expect(parseAllowedTools(normalized)).toEqual([
      "github_pr___submit_review",
    ]);
    expect(stripAllowedToolsArg(normalized)).toBe("--model custom");
  });
});
