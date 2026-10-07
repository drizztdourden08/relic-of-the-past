/* @layer root-config @kind logic */
/** GitHub issues on the project repository with the issue token mounted from
 *  Secret Manager: create one for a report, read one back by number for the sweep. */
import { readEnv } from '../env';
import { badGateway } from '../http/http-error';

const API = 'https://api.github.com';

type NewIssue = { title: string; body: string; labels: string[] };
type CreatedIssue = { number: number; html_url: string };
type IssueState = { state: 'open' | 'closed'; closed_at: string | null };

const headers = (): Record<string, string> => ({
  Authorization: `Bearer ${readEnv().GITHUB_ISSUE_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'User-Agent': 'sanctuary-api',
});

const createIssue = async (issue: NewIssue): Promise<CreatedIssue> => {
  const res = await fetch(`${API}/repos/${readEnv().GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(issue),
  });
  if (!res.ok) throw badGateway(`GitHub refused the issue with ${res.status}.`);
  const created = (await res.json()) as CreatedIssue;
  return { number: created.number, html_url: created.html_url };
};

const getIssue = async (number: number): Promise<IssueState | null> => {
  const res = await fetch(`${API}/repos/${readEnv().GITHUB_REPO}/issues/${number}`, { headers: headers() });
  if (!res.ok) return null;
  const issue = (await res.json()) as IssueState;
  return { state: issue.state, closed_at: issue.closed_at };
};

const github = { createIssue, getIssue };

export { github };
export type { NewIssue, CreatedIssue, IssueState };
