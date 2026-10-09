/* @layer sanctuary-site @kind component */
import { Chip } from '@site-kit/components/Chip/Chip';
import type { IssueStateChipProps } from './IssueStateChip.type';

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
