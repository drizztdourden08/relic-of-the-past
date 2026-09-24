/* @layer sanctuary-site @kind component */
/** One upload in flight or just finished: name and size, the percent or the state, the bar, a dismiss once it is over. */
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { IconButton } from '@ds/primitives/IconButton';
import { ProgressBar } from '@ds/primitives/ProgressBar';
import type { ProgressVariant } from '@ds/primitives/ProgressBar';
import { formatBytes } from '../../lib/format-bytes';
import type { UploadJob } from '../../upload/upload-job.type';
import './UploadRow.css';

type UploadRowProps = {
  job: UploadJob;
  onDismiss: (id: string) => void;
};

const statusOf = (job: UploadJob): { status?: string; variant: ProgressVariant } => {
  switch (job.state) {
    case 'hashing': return { status: 'hashing', variant: 'gold' };
    case 'done': return { status: 'done', variant: 'green' };
    case 'failed': return { status: job.error ?? 'failed', variant: 'danger' };
    default: return { variant: 'gold' };
  }
};

const UploadRow = (props: UploadRowProps) => {
  const { job, onDismiss } = props;
  const { status, variant } = statusOf(job);
  const over = job.state === 'done' || job.state === 'failed';
  const percent = Math.round(Math.max(0, Math.min(1, job.bytes ? job.sent / job.bytes : 0)) * 100);
  return (
    <Flex align="center" gap="md" className="upload-row" data-state={job.state}>
      <Stack gap="xs" align="stretch" className="upload-row__progress">
        <Flex align="baseline" gap="sm" justify="between">
          <Text as="span" className="upload-row__label">{job.label} ({formatBytes(job.bytes)})</Text>
          <Text as="span" className="upload-row__value">{status ?? `${percent}%`}</Text>
        </Flex>
        <ProgressBar value={percent} variant={variant} live />
      </Stack>
      {over && (
        <IconButton variant="ghost" size="sm" label="Dismiss" onClick={() => onDismiss(job.id)}>
          {'×'}
        </IconButton>
      )}
    </Flex>
  );
};

export { UploadRow };
export type { UploadRowProps };
