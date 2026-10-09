/* @layer sanctuary-site @kind component */
import { useState } from 'react';
import { FILE_TYPES, FILE_TYPE_LABELS, LIMITS } from '@rotp/hub-contracts';
import type { FileType, PatchFileBody } from '@rotp/hub-contracts';
import { Button, Field, Flex, Select, Stack, TextInput, Textarea } from '@drizztdourden08/tessera/primitives';
import { TagInput } from '@drizztdourden08/tessera/composites';
import { validateTag } from '../../../files/validate-tag';
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
      <Field label="Type">
        <Select value={type} onChange={(value) => setType(value as FileType)} options={typeOptions(types, file.type)} size="sm" />
      </Field>
      <TagInput label="Tags" value={tags} onChange={setTags} suggestions={knownTags} validate={validateTag} enforce />
      <Field label="App version">
        <TextInput value={version} onChange={(event) => setVersion(event.target.value)} />
      </Field>
      <Field label="Note" hint={`${note.length} / ${LIMITS.noteMaxChars}`}>
        <Textarea rows={2} maxLength={LIMITS.noteMaxChars} value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>
      <Flex gap="sm">
        <Button type="submit" variant="primary" size="sm" disabled={busy || !changed}>Save</Button>
        <Button type="button" variant="tertiary" size="sm" disabled={busy} onClick={onCancel}>Cancel</Button>
      </Flex>
    </Stack>
  );
};

export { FileEditForm };
