/* @layer sanctuary-site @kind component */
import { Link, Status } from '@drizztdourden08/tessera/primitives';
import type { IssueStateChipProps } from './IssueStateChip.type';

const IssueStateChip = (props: IssueStateChipProps) => {
  const { issue, className } = props;
  const status = (
    <Status variant="pill" dot tone={issue.state === 'open' ? 'success' : 'neutral'} className={issue.url ? undefined : className}>
      {`${issue.state} #${issue.number}`}
    </Status>
  );
  if (!issue.url) return status;
  return <Link href={issue.url} external tone="neutral" variant="subtle" className={className}>{status}</Link>;
};

export { IssueStateChip };
