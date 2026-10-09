/* @layer sanctuary-site @kind types */
import type { ReportIssue } from '@shared/sanctuary/report-types';

type IssueStateChipProps = {
  issue: Pick<ReportIssue, 'number' | 'state'> & { url?: string };
  className?: string;
};

export type { IssueStateChipProps };
