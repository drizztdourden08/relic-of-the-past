/* @layer site-kit @kind component */
/**
 * One job in the tray: its label and phase chip, the bar, how far it is with the speed and
 * the time left, and a note when it stopped or waits for its file. Clicking the row opens
 * the job's dialog; its buttons act on the job alone.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { ProgressBar } from '@ds/primitives/ProgressBar';
import { Text } from '@ds/primitives/Text';
import { Chip } from '../Chip/Chip';
import { percentOf, rowLines } from './behavior/row-lines';
import { RowActions } from './sub-components/RowActions';
import { BAR_VARIANTS, PHASE_CHIPS } from './UploadRow.constants';
import type { UploadRowProps } from './UploadRow.type';
import './UploadRow.css';

const UploadRow = (props: UploadRowProps) => {
  const { job, onOpen, onCancel, onDismiss, onPickFile } = props;
  const chip = PHASE_CHIPS[job.phase];
  const { transfer, timeLeft, note } = rowLines(job);
  return (
    <Box className="upload-row" data-phase={job.phase} onClick={() => onOpen(job.id)}>
      <Flex align="center" gap="sm" justify="between">
        <Button variant="bare" className="upload-row__label" title={job.label}>{job.label}</Button>
        <Chip tone={chip.tone}>{chip.label}</Chip>
      </Flex>
      {job.bytes > 0 && <ProgressBar value={percentOf(job)} variant={BAR_VARIANTS[job.phase] ?? 'gold'} live />}
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
