/* @layer site-kit @kind component */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { DialogShell } from '@ds/composites/DialogShell';
import { FILE_STEP } from '../../upload/upload-steps';
import { useDialogJob } from './behavior/useDialogJob';
import { KeptCopyBanner } from './sub-components/KeptCopyBanner';
import { StepRow } from './sub-components/StepRow';
import { UploadMeter } from './sub-components/UploadMeter';
import { DIALOG_TEXT } from './UploadProgressDialog.constants';
import type { UploadProgressDialogProps } from './UploadProgressDialog.type';
import './UploadProgressDialog.css';

const UploadProgressDialog = (props: UploadProgressDialogProps) => {
  const { queue } = props;
  const { job, close, followUp, offersFollowUp, canFollowUp, followUpLabel, showKeptCopy } = useDialogJob(queue);
  if (!job) return null;

  const actions = (
    <>
      <Button variant="tertiary" onClick={close}>Close</Button>
      {offersFollowUp && (
        <Button variant="primary" disabled={!canFollowUp} onClick={followUp}>{followUpLabel}</Button>
      )}
    </>
  );

  return (
    <DialogShell open onClose={close} title={job.title} actions={actions} className="upload-dialog">
      <Stack gap="md" align="stretch">
        {showKeptCopy && <KeptCopyBanner />}
        <Box as="ol" className="upload-dialog__steps">
          {job.steps.map((step) => (
            <StepRow key={step.id} step={step}>
              {step.id === FILE_STEP.upload && step.state === 'running' && <UploadMeter job={job} />}
            </StepRow>
          ))}
        </Box>
        {job.phase === 'needs-file' && job.fileName && (
          <Text as="p" variant="caption" role="status">{DIALOG_TEXT.needsFile(job.fileName)}</Text>
        )}
        {job.error && <Text as="p" variant="caption" role="alert" className="upload-dialog__error">{job.error}</Text>}
        <Text as="p" variant="caption" className="upload-dialog__hint">{DIALOG_TEXT.keepBrowsing}</Text>
      </Stack>
    </DialogShell>
  );
};

export { UploadProgressDialog };
export type { UploadProgressDialogProps };
