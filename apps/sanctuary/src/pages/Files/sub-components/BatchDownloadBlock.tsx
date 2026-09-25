/* @layer sanctuary-site @kind component */
/**
 * The selection panel's Download and Copy links, with the download's progress under
 * them. Over the zip limit the panel says up front that each file will be saved on its own.
 */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { ProgressBar } from '@ds/primitives/ProgressBar';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { formatBytes } from '../../../lib/format-bytes';
import { BATCH_ZIP_MAX_BYTES } from '../Files.constants';
import { fitsInZip } from '../behavior/batch-size';
import { pickKeyOf } from '../behavior/useBatchDownload';
import type { BatchDownload } from '../behavior/useBatchDownload';

type BatchDownloadBlockProps = {
  files: readonly SanctuaryFile[];
  download: BatchDownload;
  /** Another batch action is running. */
  busy: boolean;
  onCopyLinks: () => void;
};

const OVER_LIMIT_NOTE = `Over ${formatBytes(BATCH_ZIP_MAX_BYTES)} in all, so each file downloads on its own. `
  + 'The browser may ask to allow several downloads.';

const BatchDownloadBlock = (props: BatchDownloadBlockProps) => {
  const { files, download, busy, onCopyLinks } = props;
  const zipped = fitsInZip(files);
  const { running, percent, failed } = download;
  /* A download keeps running when the pick changes; its result belongs to its own pick. */
  const label = running || download.pickKey === pickKeyOf(files) ? download.label : null;

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
export type { BatchDownloadBlockProps };
