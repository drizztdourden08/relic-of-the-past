/* @layer root-config @kind logic */
import { readHubEnv } from '../../../hub-core/env';
import { badGateway } from '../../../hub-core/http/http-error';
import { readSanctuaryEnv } from '../env';
import { GITHUB_API } from './issues.constants';
import type { CreatedIssue, IssueDraft, IssueState } from './issues.type';

const headers = (): Record<string, string> => ({
  Authorization: `Bearer ${readSanctuaryEnv().GITHUB_ISSUE_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'User-Agent': 'sanctuary-api',
});

const createIssue = async (issue: IssueDraft): Promise<CreatedIssue> => {
  const res = await fetch(`${GITHUB_API}/repos/${readHubEnv().GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(issue),
  });
  if (!res.ok) throw badGateway(`GitHub refused the issue with ${res.status}.`);
  const created = (await res.json()) as CreatedIssue;
  return { number: created.number, html_url: created.html_url };
};

const getIssue = async (number: number): Promise<IssueState | null> => {
  const res = await fetch(`${GITHUB_API}/repos/${readHubEnv().GITHUB_REPO}/issues/${number}`, { headers: headers() });
  if (!res.ok) return null;
  const issue = (await res.json()) as IssueState;
  return { state: issue.state, closed_at: issue.closed_at };
};

const github = { createIssue, getIssue };

export { github };
