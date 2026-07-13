import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import * as core from "@actions/core";
import * as token from "../../src/github/token";
import * as client from "../../src/github/api/client";
import * as contextMod from "../../src/github/context";
import * as validator from "../../src/tag/commands/review-validator";
import type { ReviewDelivery } from "../../src/core/review/delivery";

function createContext(reviewDelivery: ReviewDelivery) {
  return {
    eventName: "issue_comment",
    runId: "1",
    repository: { owner: "o", repo: "r", full_name: "o/r" },
    actor: "a",
    inputs: {
      triggerPhrase: "@droid",
      assigneeTrigger: "",
      labelTrigger: "droid",
      useStickyComment: false,
      allowedBots: "",
      allowedNonWriteUsers: "",
      trackProgress: false,
      automaticReview: true,
      automaticSecurityReview: false,
      reviewDelivery,
    },
    payload: {} as any,
    entityNumber: 1,
    isPR: true,
  } as any;
}

describe("prepare-validator entrypoint", () => {
  const originalCommentId = process.env.DROID_COMMENT_ID;
  let setFailedSpy: ReturnType<typeof spyOn>;
  let setOutputSpy: ReturnType<typeof spyOn>;
  let tokenSpy: ReturnType<typeof spyOn>;
  let clientSpy: ReturnType<typeof spyOn>;
  let contextSpy: ReturnType<typeof spyOn>;
  let validatorSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    delete process.env.DROID_COMMENT_ID;
    setFailedSpy = spyOn(core, "setFailed").mockImplementation(() => {});
    setOutputSpy = spyOn(core, "setOutput").mockImplementation(() => {});
    tokenSpy = spyOn(token, "setupGitHubToken").mockResolvedValue("token");
    clientSpy = spyOn(client, "createOctokit").mockReturnValue({} as any);
    contextSpy = spyOn(contextMod, "parseGitHubContext");
    validatorSpy = spyOn(
      validator,
      "prepareReviewValidatorMode",
    ).mockResolvedValue({
      branchInfo: { baseBranch: "main", currentBranch: "feat" },
      mcpTools: "{}",
    });
  });

  afterEach(() => {
    setFailedSpy.mockRestore();
    setOutputSpy.mockRestore();
    tokenSpy.mockRestore();
    clientSpy.mockRestore();
    contextSpy.mockRestore();
    validatorSpy.mockRestore();
    if (originalCommentId === undefined) {
      delete process.env.DROID_COMMENT_ID;
    } else {
      process.env.DROID_COMMENT_ID = originalCommentId;
    }
  });

  it("fails when DROID_COMMENT_ID is missing for direct delivery", async () => {
    contextSpy.mockReturnValue(createContext("direct"));
    const exitSpy = spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit");
    }) as any);

    const mod = await import(
      `../../src/entrypoints/prepare-validator.ts?test=${Math.random()}`
    );

    await expect(mod.default()).rejects.toBeTruthy();
    expect(setFailedSpy).toHaveBeenCalled();
    expect(setOutputSpy).toHaveBeenCalledWith(
      "prepare_error",
      expect.stringContaining("DROID_COMMENT_ID"),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(validatorSpy).not.toHaveBeenCalled();

    exitSpy.mockRestore();
  });

  it("allows artifact-only validation without a tracking comment", async () => {
    contextSpy.mockReturnValue(createContext("artifact-only"));
    const mod = await import(
      `../../src/entrypoints/prepare-validator.ts?test=${Math.random()}`
    );

    await mod.default();

    expect(setFailedSpy).not.toHaveBeenCalled();
    expect(validatorSpy).toHaveBeenCalledWith({
      context: expect.objectContaining({
        inputs: expect.objectContaining({
          reviewDelivery: "artifact-only",
        }),
      }),
      octokit: {},
      githubToken: "token",
      trackingCommentId: undefined,
    });
  });
});
