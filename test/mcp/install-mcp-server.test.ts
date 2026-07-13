import { afterEach, describe, expect, it } from "bun:test";
import { prepareMcpTools } from "../../src/mcp/install-mcp-server";
import { createMockContext } from "../mockContext";

describe("prepareMcpTools publisher registration", () => {
  const originalWorkflowToken = process.env.DEFAULT_WORKFLOW_TOKEN;

  afterEach(() => {
    if (originalWorkflowToken === undefined) {
      delete process.env.DEFAULT_WORKFLOW_TOKEN;
    } else {
      process.env.DEFAULT_WORKFLOW_TOKEN = originalWorkflowToken;
    }
  });

  it("omits the tracking server when its tool is not allowed", async () => {
    delete process.env.DEFAULT_WORKFLOW_TOKEN;
    const config = JSON.parse(
      await prepareMcpTools({
        githubToken: "model-runner-token",
        owner: "owner",
        repo: "repo",
        allowedTools: ["Read", "Create"],
        mode: "tag",
        context: createMockContext({ isPR: true }),
      }),
    );

    expect(config.mcpServers.github_comment).toBeUndefined();
    expect(config.mcpServers.github_pr).toBeUndefined();
  });

  it("keeps direct delivery registration backward compatible", async () => {
    delete process.env.DEFAULT_WORKFLOW_TOKEN;
    const config = JSON.parse(
      await prepareMcpTools({
        githubToken: "direct-token",
        owner: "owner",
        repo: "repo",
        droidCommentId: "42",
        allowedTools: ["github_comment___update_droid_comment"],
        mode: "tag",
        context: createMockContext({ isPR: true }),
      }),
    );

    expect(config.mcpServers.github_comment.env.GITHUB_TOKEN).toBe(
      "direct-token",
    );
    expect(config.mcpServers.github_comment.env.DROID_COMMENT_ID).toBe("42");
  });
});
