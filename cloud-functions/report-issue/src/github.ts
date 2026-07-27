/* @layer root-config @kind logic */
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import type { CreateIssueRequest, CreateIssueResult } from './types';

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

const buildBody = (req: CreateIssueRequest): string => {
  const parts = [
    `**Reporter contact:** ${req.email}`,
    req.message.trim(),
    `<details>\n<summary>Debug info</summary>\n\n\`\`\`\n${req.debugInfo}\n\`\`\`\n\n</details>`,
  ];
  return parts.join('\n\n');
};

const submitIssueReport = async (req: CreateIssueRequest): Promise<CreateIssueResult> => {
  const token = await getToken();
  const res = await fetch(`${API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: req.title, body: buildBody(req), labels: ['player-report'] }),
  });
  if (!res.ok) throw new Error(`issue creation failed: ${res.status}`);
  const issue = await res.json();
  return { url: issue.html_url as string };
};

export { submitIssueReport };
