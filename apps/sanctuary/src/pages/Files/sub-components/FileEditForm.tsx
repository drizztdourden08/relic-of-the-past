/* @layer sanctuary-site @kind component */
import { useState } from 'react';
import { FILE_TYPES, FILE_TYPE_LABELS } from '@rotp/hub-contracts';
import type { FileType, PatchFileBody } from '@rotp/hub-contracts';
import { FormActions } from '@rotp/design';
import { Stack } from '@drizztdourden08/tessera/primitives';
import { FileMetaFields } from '../../../components/FileMetaFields';
import type { FileEditFormProps } from './FileEditForm.type';

const typeOptions = (types: readonly FileType[], own: FileType) =>
  FILE_TYPES.filter((type) => type === own || types.includes(type)).map((type) => ({ value: type, label: FILE_TYPE_LABELS[type] }));

const sameTags = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((tag, i) => tag === b[i]);

const FileEditForm = (props: FileEditFormProps) => {
  const { file, knownTags, types, busy, onSave, onCancel } = props;
  const [type, setType] = useState<FileType>(file.type);
  const [tags, setTags] = useState<readonly string[]>(file.tags);
  const [version, setVersion] = useState(file.version ?? '');
  const [note, setNote] = useState(file.note);

  const patch: PatchFileBody = {};
  if (type !== file.type) patch.type = type;
  if (!sameTags(tags, file.tags)) patch.tags = [...tags];
  if ((version.trim() || null) !== file.version) patch.version = version.trim() || null;
  if (note.trim() !== file.note) patch.note = note.trim();
  const changed = Object.keys(patch).length > 0;

  return (
    <Stack as="form" gap="sm" align="stretch" onSubmit={(event) => { event.preventDefault(); onSave(patch); }}>
      <FileMetaFields
        variant="edit"
        type={type}
        typeOptions={typeOptions(types, file.type)}
        tags={tags}
        knownTags={knownTags}
        version={version}
        note={note}
        onTypeChange={setType}
        onTagsChange={setTags}
        onVersionChange={setVersion}
        onNoteChange={setNote}
      />
      <FormActions busy={busy} canSave={changed} onCancel={onCancel} />
    </Stack>
  );
};

export { FileEditForm };
