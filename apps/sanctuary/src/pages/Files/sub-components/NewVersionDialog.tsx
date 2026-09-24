/* @layer sanctuary-site @kind component */
/**
 * The one confirmation before a new version uploads: which file it becomes the next
 * version of, the dropped file's name and size, and an optional one-line note on what
 * changed.
 */
import { useEffect, useRef, useState } from 'react';
import { LIMITS } from '@shared/sanctuary/limits';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { DialogShell } from '@ds/composites/DialogShell';
import { Row } from '../../../components/Row/Row';
import { formatBytes } from '../../../lib/format-bytes';
import { nextVersionNumber, versionLabel } from '../../../files/file-versions';
import type { VersionRequest } from '../behavior/drop-queue';

type NewVersionDialogProps = {
  request: VersionRequest | null;
  onConfirm: (note: string) => void;
  onCancel: () => void;
};

const NOTE_ID = 'new-version-note';

const NewVersionDialog = (props: NewVersionDialogProps) => {
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

export { NewVersionDialog };
export type { NewVersionDialogProps };
