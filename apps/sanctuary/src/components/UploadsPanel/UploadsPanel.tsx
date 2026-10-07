/* @layer sanctuary-site @kind component */
/**
 * The uploads side panel: a header with "Clear finished" and a close that hides the panel,
 * then one row per upload with its progress, newest first. A finished row can be dismissed.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Stack } from '@ds/primitives/Stack';
import { WindowHeader } from '@ds/composites/WindowHeader';
import { UploadRow } from '../UploadRow/UploadRow';
import { isFinished } from '../../upload/useMultipartUpload';
import type { UploadJob } from '../../upload/upload-job.type';
import './UploadsPanel.css';

type UploadsPanelProps = {
  jobs: readonly UploadJob[];
  onDismiss: (id: string) => void;
  onClearFinished: () => void;
  onClose: () => void;
};

const UploadsPanel = (props: UploadsPanelProps) => {
  const { jobs, onDismiss, onClearFinished, onClose } = props;
  const anyFinished = jobs.some(isFinished);
  const clear = (
    <Button variant="ghost" size="sm" disabled={!anyFinished} onClick={onClearFinished}>Clear finished</Button>
  );
  return (
    <Box as="section" className="side-panel uploads-panel" aria-label="Uploads">
      <Stack gap="sm" align="stretch">
        <WindowHeader title="Uploads" extra={clear} onClose={onClose} className="uploads-panel__head" />
        <Stack gap="xs" align="stretch" className="uploads-panel__list">
          {jobs.map((job) => <UploadRow key={job.id} job={job} onDismiss={onDismiss} />)}
        </Stack>
      </Stack>
    </Box>
  );
};

export { UploadsPanel };
export type { UploadsPanelProps };
