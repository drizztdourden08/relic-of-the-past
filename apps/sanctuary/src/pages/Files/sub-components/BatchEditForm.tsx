/* @layer sanctuary-site @kind component */
/**
 * The selection panel's edits: one type to set on every picked file, and tags to add to
 * or remove from all of them. Only the caller's own files are written; the panel says
 * which ones are skipped.
 */
import { useState } from 'react';
import { FILE_TYPE_LABELS } from '@shared/sanctuary/file-types';
import type { FileType } from '@shared/sanctuary/file-types';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Select } from '@ds/primitives/Select';
import { Stack } from '@ds/primitives/Stack';
import { TagInput } from '@ds/primitives/TagInput';
import { validateTag } from '../../../files/validate-tag';

type BatchEditFormProps = {
  /** The types the caller may move a file to. */
  types: readonly FileType[];
  /** Offered while typing: every tag in use, and the ones on the picked files first. */
  knownTags: readonly string[];
  busy: boolean;
  onSetType: (type: FileType) => void;
  onAddTags: (tags: readonly string[]) => void;
  onRemoveTags: (tags: readonly string[]) => void;
};

const NO_TAGS: readonly string[] = [];

const BatchEditForm = (props: BatchEditFormProps) => {
  const { types, knownTags, busy, onSetType, onAddTags, onRemoveTags } = props;
  const [type, setType] = useState<FileType | ''>(types[0] ?? '');
  const [tags, setTags] = useState<readonly string[]>(NO_TAGS);
  const options = types.map((value) => ({ value, label: FILE_TYPE_LABELS[value] }));
  const noTags = busy || tags.length === 0;

  const applyTags = (apply: (tags: readonly string[]) => void) => {
    apply(tags);
    setTags(NO_TAGS);
  };

  return (
    <Stack gap="sm" align="stretch" className="selection-panel__edits">
      <Field label="Type">
        <Flex gap="sm" align="center">
          <Select value={type} onChange={(value) => setType(value as FileType)} options={options} size="sm" className="selection-panel__type" />
          <Button variant="secondary" size="sm" disabled={busy || type === ''} onClick={() => type && onSetType(type)}>
            Set type
          </Button>
        </Flex>
      </Field>
      <TagInput label="Tags" value={tags} onChange={setTags} suggestions={knownTags} validate={validateTag} enforce />
      <Flex gap="sm">
        <Button variant="secondary" size="sm" disabled={noTags} onClick={() => applyTags(onAddTags)}>Add tags</Button>
        <Button variant="secondary" size="sm" disabled={noTags} onClick={() => applyTags(onRemoveTags)}>Remove tags</Button>
      </Flex>
    </Stack>
  );
};

export { BatchEditForm };
export type { BatchEditFormProps };
