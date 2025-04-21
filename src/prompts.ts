import { toolHandlers } from "./tools.js";

export const prompts = {
  "prompt://create-issue": {
    name: "prompt://create-issue",
    description: "Generate a prompt to create a GitHub issue",
    arguments: [
      { name: "title", description: "Issue title", required: true },
      { name: "body", description: "Issue body/content", required: true },
      { name: "labels", description: "Optional labels", required: false },
    ],
  },
  "prompt://comment-issue": {
    name: "prompt://comment-issue",
    description: "Generate a prompt to comment on a GitHub issue",
    arguments: [
      {
        name: "issue_number",
        description: "Target issue number",
        required: true,
      },
      { name: "comment", description: "Comment text", required: true },
    ],
  },
};

export const promptHandlers = {
  "prompt://create-issue": ({
    title,
    body,
    labels,
  }: {
    title: string;
    body: string;
    labels?: string[];
  }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please create an issue titled "${title}" with description "${body}"${
            labels ? ` and labels ${JSON.stringify(labels)}` : ""
          }.`,
        },
      },
    ],
  }),

  "prompt://comment-issue": ({
    issue_number,
    comment,
  }: {
    issue_number: number;
    comment: string;
  }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please add a comment to issue #${issue_number}: "${comment}".`,
        },
      },
    ],
  }),

  // Resource handlers
  "resource://issues/list": async () => ({
    contents: [
      {
        uri: "resource://issues/list",
        text: JSON.stringify(await toolHandlers.listIssues(), null, 2),
      },
    ],
  }),

  "resource://issues/{number}": async ({
    issue_number,
  }: {
    issue_number: number;
  }) => ({
    contents: [
      {
        uri: `resource://issues/${issue_number}`,
        text: JSON.stringify(
          await toolHandlers.getIssue(issue_number),
          null,
          2
        ),
      },
    ],
  }),
};
