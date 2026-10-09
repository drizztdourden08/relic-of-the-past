/* @layer sanctuary-site @kind component */
import { useEffect, useRef, useState } from 'react';
import { LIMITS } from '@shared/sanctuary/limits';
import { Button, Field, Stack, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { DialogShell } from '@drizztdourden08/tessera/composites';
import { Row } from '@site-kit/components/Row/Row';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { nextVersionNumber, versionLabel } from '../../../files/file-versions';
import { NOTE_ID } from './VersionUploadDialog.constants';
import type { VersionUploadDialogProps } from './VersionUploadDialog.type';

const VersionUploadDialog = (props: VersionUploadDialogProps) => {
  const { request, onConfirm, onCancel } = props;
  const [note, setNote] = useState('');
  const noteRef = useRef<HTMLInputElement>(null);
  const open = request !== null;

  useEffect(() => {
    if (open) setNote('');
  }, [open]);

  const next = request ? versionLabel(nextVersionNumber(request.file)) : '';
  const confirm = () => onConfirm(note.trim());

  const actions = (
    <>
      <Button variant="tertiary" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" onClick={confirm}>Upload {next}</Button>
    </>
  );

  return (
    <DialogShell open={open} onClose={onCancel} title="New version" actions={actions} initialFocusRef={noteRef} className="version-dialog">
      {request && (
        <Stack gap="md" align="stretch">
          <Text as="p" className="version-dialog__lead">{next} of {request.file.name}</Text>
          <Row label="file" value={`${request.dropped.name} · ${formatBytes(request.dropped.size)}`} className="version-dialog__row" />
          <Field label="What changed (optional)" htmlFor={NOTE_ID} hint={`${note.length} / ${LIMITS.noteMaxChars}`}>
            <TextInput
              id={NOTE_ID}
              ref={noteRef}
              value={note}
              maxLength={LIMITS.noteMaxChars}
              placeholder="one line"
              onChange={(event) => setNote(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') confirm(); }}
            />
          </Field>
        </Stack>
      )}
    </DialogShell>
  );
};

export { VersionUploadDialog };
