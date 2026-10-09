/* @layer site-kit @kind component */
import { Box, Flex, Pressable, ProgressBar, Status, Text } from '@drizztdourden08/tessera/primitives';
import { percentOf } from './behavior/percent-of';
import { rowLines } from './behavior/row-lines';
import { RowActions } from './sub-components/RowActions';
import { BAR_VARIANTS, PHASE_STATUSES } from './UploadRow.constants';
import type { UploadRowProps } from './UploadRow.type';
import './UploadRow.css';

const UploadRow = (props: UploadRowProps) => {
  const { job, onOpen, onCancel, onDismiss, onPickFile } = props;
  const { transfer, timeLeft, note } = rowLines(job);
  return (
    <Box className="upload-row" data-phase={job.phase} onClick={() => onOpen(job.id)}>
      <Flex align="center" gap="sm" justify="between">
        <Pressable className="upload-row__label" title={job.label}>{job.label}</Pressable>
        <Status variant="pill" map={PHASE_STATUSES} value={job.phase} />
      </Flex>
      {job.bytes > 0 && <ProgressBar value={percentOf(job)} tone={BAR_VARIANTS[job.phase] ?? 'primary'} live />}
      {(transfer || timeLeft) && (
        <Flex align="baseline" gap="sm" justify="between">
          <Text as="span" className="upload-row__value">{transfer}</Text>
          {timeLeft && <Text as="span" className="upload-row__value">{timeLeft}</Text>}
        </Flex>
      )}
      {note && <Text as="p" variant="caption" className="upload-row__note">{note}</Text>}
      <RowActions job={job} onCancel={onCancel} onDismiss={onDismiss} onPickFile={onPickFile} />
    </Box>
  );
};

export { UploadRow };
export type { UploadRowProps };
