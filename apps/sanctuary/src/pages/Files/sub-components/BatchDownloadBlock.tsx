/* @layer sanctuary-site @kind component */
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { ProgressBar } from '@ds/primitives/ProgressBar';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { fitsInZip } from '../behavior/batch-size';
import { pickKeyOf } from '../behavior/pick-key-of';
import { OVER_LIMIT_NOTE } from './BatchDownloadBlock.constants';
import type { BatchDownloadBlockProps } from './BatchDownloadBlock.type';

const BatchDownloadBlock = (props: BatchDownloadBlockProps) => {
  const { files, download, busy, onCopyLinks } = props;
  const zipped = fitsInZip(files);
  const { running, percent, failed } = download;
  const resultIsForThisPick = download.pickKey === pickKeyOf(files);
  const label = running || resultIsForThisPick ? download.label : null;

  return (
    <Stack gap="xs" align="stretch">
      <Flex gap="sm" wrap>
        <Button variant="primary" size="sm" disabled={running} onClick={() => void download.download(files)}>
          {zipped ? 'Download as zip' : 'Download each'}
        </Button>
        <Button variant="secondary" size="sm" disabled={busy} onClick={onCopyLinks}>Copy links</Button>
      </Flex>
      {!zipped && <Text as="p" variant="caption" className="selection-panel__note">{OVER_LIMIT_NOTE}</Text>}
      {running && <ProgressBar value={percent} live />}
      {label && (
        <Text as="p" variant="caption" role={failed ? 'alert' : 'status'} className="selection-panel__note">
          {label}
        </Text>
      )}
    </Stack>
  );
};

export { BatchDownloadBlock };
