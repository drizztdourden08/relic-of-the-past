/* @layer root-config @kind types */
type IssueDraft = { title: string; body: string; labels: string[] };
type CreatedIssue = { number: number; html_url: string };
type IssueState = { state: 'open' | 'closed'; closed_at: string | null };

export type { IssueDraft, CreatedIssue, IssueState };
