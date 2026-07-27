interface CreateIssueRequest {
  email: string;
  title: string;
  message: string;
  debugInfo: string;
}

interface CreateIssueResult {
  url: string;
}

export type { CreateIssueRequest, CreateIssueResult };
