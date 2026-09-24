/* @layer sanctuary-site @kind component */
/** The issue pill: `#253` in green while open, dimmed once closed; a link when a url is given. */
import type { ReportIssue } from '@shared/sanctuary/report-types';
import { Chip } from '../Chip/Chip';

type IssueStateChipProps = {
  issue: Pick<ReportIssue, 'number' | 'state'> & { url?: string };
  className?: string;
};

const IssueStateChip = (props: IssueStateChipProps) => {
  const { issue, className } = props;
  const tone = issue.state === 'open' ? 'green' : 'muted';
  const label = `${issue.state} #${issue.number}`;
  return (
    <Chip tone={tone} href={issue.url} className={className}>
      {label}{issue.url ? ` ${'↗'}` : ''}
    </Chip>
  );
};

export { IssueStateChip };
export type { IssueStateChipProps };
