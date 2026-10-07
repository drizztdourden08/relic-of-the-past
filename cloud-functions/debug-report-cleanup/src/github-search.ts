/* @layer root-config @kind logic */
/** Finds the closed GitHub issue a debug report is attached to, if any. The bug-report dialog
 *  folds "debug-report-id: <id>" into the issue body on submit (see useBugReportForm.ts), so
 *  a text search for that line is how cleanup rediscovers the link without a direct write path
 *  between the two Cloud Functions. Reuses report-issue's own token: search only needs read
 *  access, a subset of what that token already has. */
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const GITHUB_OWNER = 'drizztdourden08';
const GITHUB_REPO = 'relic-of-the-past';
const API = 'https://api.github.com';
const SECRET_NAME = 'projects/rotp-bugreports/secrets/github-issue-token/versions/latest';

const secrets = new SecretManagerServiceClient();
let cachedToken: string | null = null;

const getToken = async (): Promise<string> => {
  if (cachedToken) return cachedToken;
  const [version] = await secrets.accessSecretVersion({ name: SECRET_NAME });
  cachedToken = version.payload?.data?.toString() ?? '';
  return cachedToken;
};

interface ClosedIssue {
  closedAt: number;
}

const findClosedIssueForReport = async (reportId: string): Promise<ClosedIssue | null> => {
  const token = await getToken();
  const q = encodeURIComponent(`repo:${GITHUB_OWNER}/${GITHUB_REPO} state:closed "debug-report-id: ${reportId}"`);
  const res = await fetch(`${API}/search/issues?q=${q}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { items: { closed_at: string | null }[] };
  const closedAt = data.items[0]?.closed_at;
  return closedAt ? { closedAt: new Date(closedAt).getTime() } : null;
};

export { findClosedIssueForReport };
export type { ClosedIssue };
