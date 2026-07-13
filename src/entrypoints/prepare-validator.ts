#!/usr/bin/env bun

import * as core from "@actions/core";
import { setupGitHubToken } from "../github/token";
import { createOctokit } from "../github/api/client";
import { parseGitHubContext, isEntityContext } from "../github/context";
import { prepareReviewValidatorMode } from "../tag/commands/review-validator";
import { isArtifactOnlyDelivery } from "../core/review/delivery";

async function run() {
  try {
    const context = parseGitHubContext();

    if (!isEntityContext(context) || !context.isPR) {
      throw new Error("prepare-validator requires a pull request context");
    }

    const githubToken = await setupGitHubToken();
    const octokit = createOctokit(githubToken);

    const rawTrackingCommentId = process.env.DROID_COMMENT_ID;
    const trackingCommentId = rawTrackingCommentId
      ? Number(rawTrackingCommentId)
      : undefined;
    if (
      !isArtifactOnlyDelivery(context.inputs.reviewDelivery) &&
      (!trackingCommentId || Number.isNaN(trackingCommentId))
    ) {
      throw new Error("DROID_COMMENT_ID is required for validator run");
    }

    const result = await prepareReviewValidatorMode({
      context,
      octokit,
      githubToken,
      trackingCommentId,
    });

    core.setOutput("github_token", githubToken);
    if (result?.mcpTools) core.setOutput("mcp_tools", result.mcpTools);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(`Prepare validator step failed with error: ${errorMessage}`);
    core.setOutput("prepare_error", errorMessage);
    process.exit(1);
  }
}

export default run;

if (import.meta.main) {
  run();
}
