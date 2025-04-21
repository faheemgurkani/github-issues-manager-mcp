import axios from "axios";

const { GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN } = process.env;
if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) {
  throw new Error(
    "GITHUB_OWNER, GITHUB_REPO, and GITHUB_TOKEN must be set in env"
  );
}

const api = axios.create({
  baseURL: `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`,
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  },
});

export const tools = {
  "tool://create-issue": {
    name: "tool://create-issue",
    description: "Create a new GitHub issue",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        labels: { type: "array", items: { type: "string" } },
      },
      required: ["title", "body"],
    },
  },
  "tool://comment-issue": {
    name: "tool://comment-issue",
    description: "Add a comment to an existing GitHub issue",
    inputSchema: {
      type: "object",
      properties: {
        issue_number: { type: "number" },
        comment: { type: "string" },
      },
      required: ["issue_number", "comment"],
    },
  },
};

export const toolHandlers = {
  async "tool://create-issue"({
    title,
    body,
    labels,
  }: {
    title: string;
    body: string;
    labels?: string[];
  }) {
    const resp = await api.post("/issues", { title, body, labels });
    return { issue_number: resp.data.number, url: resp.data.html_url };
  },

  async "tool://comment-issue"({
    issue_number,
    comment,
  }: {
    issue_number: number;
    comment: string;
  }) {
    const resp = await api.post(`/issues/${issue_number}/comments`, {
      body: comment,
    });
    return { comment_url: resp.data.html_url };
  },

  // Helpers for resource handlers
  async listIssues() {
    const resp = await api.get("/issues", { params: { state: "open" } });
    return resp.data;
  },

  async getIssue(issue_number: number) {
    const resp = await api.get(`/issues/${issue_number}`);
    return resp.data;
  },
};
