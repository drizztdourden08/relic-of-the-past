/* @layer sanctuary-site @kind component */
import { useState } from 'react';
import { FILE_TYPE_LABELS } from '@rotp/hub-contracts';
import type { FileType } from '@rotp/hub-contracts';
import { Button, Field, Flex, Select, Stack } from '@drizztdourden08/tessera/primitives';
import { TagInput } from '@drizztdourden08/tessera/composites';
import { validateTag } from '../../../files/validate-tag';
import { NO_TAGS } from './BatchEditForm.constants';
import type { BatchEditFormProps } from './BatchEditForm.type';

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
