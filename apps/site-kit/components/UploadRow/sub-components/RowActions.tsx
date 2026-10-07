/* @layer site-kit @kind component */
/**
 * A tray row's buttons: Cancel while the job can still stop, the file picker for a job a
 * reload left without its file, and Dismiss once it is over. A click here stays here and
 * does not open the dialog.
 */
import type { MouseEvent } from 'react';
import { Button } from '@ds/primitives/Button';
import { DropZone } from '@ds/primitives/DropZone';
import { Flex } from '@ds/primitives/Flex';
import { IconButton } from '@ds/primitives/IconButton';
import type { UploadJob, UploadPhase } from '../../../upload/upload-job.type';
import type { UploadRowProps } from '../UploadRow.type';

type RowActionsProps = Pick<UploadRowProps, 'onCancel' | 'onDismiss' | 'onPickFile'> & { job: UploadJob };

const CANCELLABLE: ReadonlySet<UploadPhase> = new Set(['queued', 'hashing', 'uploading', 'needs-file']);

const stay = (event: MouseEvent) => event.stopPropagation();

const RowActions = (props: RowActionsProps) => {
  const { job, onCancel, onDismiss, onPickFile } = props;
  const { id, phase } = job;
  const over = phase === 'done' || phase === 'failed';
  if (over) {
    return (
      <IconButton variant="ghost" size="sm" label="Dismiss" className="upload-row__dismiss" onClick={(event) => { stay(event); onDismiss(id); }}>
        {'×'}
      </IconButton>
    );
  }
  if (!CANCELLABLE.has(phase)) return null;
  return (
    <Flex align="stretch" justify="end" gap="sm" wrap className="upload-row__actions" onClick={stay}>
      <Button variant="ghost" size="sm" onClick={() => onCancel(id)}>Cancel</Button>
      {phase === 'needs-file' && (
        <DropZone variant="inline" label="Pick the file" onDrop={(files) => files[0] && onPickFile(id, files[0])} />
      )}
    </Flex>
  );
};

export { RowActions };
export type { RowActionsProps };
