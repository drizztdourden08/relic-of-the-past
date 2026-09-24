/* @layer sanctuary-site @kind component */
/**
 * What is asked before an upload starts: type (preset from the rail), tags, version and
 * note, one answer for every file of the drop. The tag rule is the shared schema's, so a
 * tag refused here would have been refused by the API.
 */
import { useEffect, useState } from 'react';
import { FILE_TYPES, FILE_TYPE_LABELS } from '@shared/sanctuary/file-types';
import type { FileType } from '@shared/sanctuary/file-types';
import { LIMITS } from '@shared/sanctuary/limits';
import { tagsSchema } from '@shared/sanctuary/schemas/common';
import { Button } from '@ds/primitives/Button';
import { Stack } from '@ds/primitives/Stack';
import { Field } from '@ds/primitives/Field';
import { Select } from '@ds/primitives/Select';
import { TagInput } from '@ds/primitives/TagInput';
import { TextInput } from '@ds/primitives/TextInput';
import { Textarea } from '@ds/primitives/Textarea';
import { Text } from '@ds/primitives/Text';
import { DialogShell } from '@ds/composites/DialogShell';
import { formatBytes } from '../../lib/format-bytes';
import type { UploadMeta } from '../../upload/upload-job.type';
import './UploadDialog.css';

type UploadDialogProps = {
  files: File[];
  defaultType: FileType;
  /** Tags already in use, offered as suggestions. */
  knownTags: readonly string[];
  onConfirm: (meta: UploadMeta) => void;
  onCancel: () => void;
};

const TYPE_OPTIONS = FILE_TYPES.map((type) => ({ value: type, label: FILE_TYPE_LABELS[type] }));
const TAG_HINT = 'lowercase letters, digits, dots, dashes';

const validateTag = (raw: string) => tagsSchema.safeParse([raw]).success || TAG_HINT;

const UploadDialog = (props: UploadDialogProps) => {
  const { files, defaultType, knownTags, onConfirm, onCancel } = props;
  const open = files.length > 0;
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
          <Select value={type} onChange={(value) => setType(value as FileType)} options={TYPE_OPTIONS} />
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
        <Field label="Version" hint="The app version the file relates to, if any.">
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
export type { UploadDialogProps };
