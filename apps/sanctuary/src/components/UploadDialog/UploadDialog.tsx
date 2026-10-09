/* @layer sanctuary-site @kind component */
import { useEffect, useMemo, useState } from 'react';
import { FILE_TYPES, FILE_TYPE_LABELS } from '@shared/sanctuary/file-types';
import type { FileType } from '@shared/sanctuary/file-types';
import { LIMITS } from '@shared/sanctuary/limits';
import { Button } from '@ds/primitives/Button';
import { Stack } from '@ds/primitives/Stack';
import { Field } from '@ds/primitives/Field';
import { Select } from '@ds/primitives/Select';
import { TagInput } from '@ds/primitives/TagInput';
import { TextInput } from '@ds/primitives/TextInput';
import { Textarea } from '@ds/primitives/Textarea';
import { Text } from '@ds/primitives/Text';
import { DialogShell } from '@ds/composites/DialogShell';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { validateTag } from '../../files/validate-tag';
import type { UploadDialogProps } from './UploadDialog.type';
import './UploadDialog.css';

const UploadDialog = (props: UploadDialogProps) => {
  const { files, types, defaultType, knownTags, onConfirm, onCancel } = props;
  const open = files.length > 0;
  const typeOptions = useMemo(
    () => FILE_TYPES.filter((t) => types.includes(t)).map((t) => ({ value: t, label: FILE_TYPE_LABELS[t] })),
    [types],
  );
  const [type, setType] = useState<FileType>(defaultType);
  const [tags, setTags] = useState<readonly string[]>([]);
  const [version, setVersion] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(defaultType);
    setTags([]);
    setVersion('');
    setNote('');
  }, [open, defaultType]);

  const confirm = () => onConfirm({
    type,
    tags: [...tags],
    version: version.trim() || null,
    note: note.trim(),
  });

  const total = files.reduce((sum, file) => sum + file.size, 0);
  const actions = (
    <>
      <Button variant="tertiary" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" onClick={confirm}>
        Upload {files.length === 1 ? '1 file' : `${files.length} files`}
      </Button>
    </>
  );

  return (
    <DialogShell open={open} onClose={onCancel} title="Upload" actions={actions} className="upload-dialog">
      <Stack gap="md" align="stretch">
        <Text as="ul" className="upload-dialog__files">
          {files.map((file) => (
            <Text as="li" key={`${file.name}:${file.size}`} className="upload-dialog__file">
              <Text as="span">{file.name}</Text>
              <Text as="span" variant="caption">{formatBytes(file.size)}</Text>
            </Text>
          ))}
        </Text>
        <Text as="p" variant="caption">{formatBytes(total)} in total, stored exactly as sent.</Text>
        <Field label="Type">
          <Select value={type} onChange={(value) => setType(value as FileType)} options={typeOptions} />
        </Field>
        <TagInput
          label="Tags"
          value={tags}
          onChange={setTags}
          suggestions={knownTags}
          validate={validateTag}
          enforce
          placeholder="castle, jail..."
        />
        <Field label="App version" hint="The app version the file relates to, if any.">
          <TextInput value={version} onChange={(event) => setVersion(event.target.value)} placeholder="0.20.7" />
        </Field>
        <Field label="Note" hint={`${note.length} / ${LIMITS.noteMaxChars}`}>
          <Textarea
            rows={2}
            maxLength={LIMITS.noteMaxChars}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>
      </Stack>
    </DialogShell>
  );
};

export { UploadDialog };
