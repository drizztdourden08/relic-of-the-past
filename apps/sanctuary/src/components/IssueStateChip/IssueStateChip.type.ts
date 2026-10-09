/* @layer sanctuary-site @kind types */
import type { ReportIssue } from '@rotp/hub-contracts';

type IssueStateChipProps = {
  issue: Pick<ReportIssue, 'number' | 'state'> & { url?: string };
  className?: string;
};

export type { IssueStateChipProps };
