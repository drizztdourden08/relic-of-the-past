/* @layer sanctuary-site @kind component */
/** The inline edit of a file's type, tags, app version and note; Save sends only what changed. */
import { useState } from 'react';
import { FILE_TYPES, FILE_TYPE_LABELS } from '@shared/sanctuary/file-types';
import type { FileType, SanctuaryFile } from '@shared/sanctuary/file-types';
import { LIMITS } from '@shared/sanctuary/limits';
import type { PatchFileBody } from '@shared/sanctuary/schemas/file-schemas';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Select } from '@ds/primitives/Select';
import { Stack } from '@ds/primitives/Stack';
import { TagInput } from '@ds/primitives/TagInput';
import { TextInput } from '@ds/primitives/TextInput';
import { Textarea } from '@ds/primitives/Textarea';
import { validateTag } from '../../../files/validate-tag';

type FileEditFormProps = {
  file: SanctuaryFile;
  knownTags: readonly string[];
  /** The types the caller may see; a file moved elsewhere would vanish from their list. */
  types: readonly FileType[];
  busy: boolean;
  onSave: (patch: PatchFileBody) => void;
  onCancel: () => void;
};

/** The caller's types, plus the file's own so the select never shows a blank. */
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
export type { FileEditFormProps };
