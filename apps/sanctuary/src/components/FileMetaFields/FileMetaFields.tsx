/* @layer sanctuary-site @kind component */
import { LIMITS } from '@rotp/hub-contracts';
import type { FileType } from '@rotp/hub-contracts';
import { Field, Select, TextInput, Textarea } from '@drizztdourden08/tessera/primitives';
import { TagInput } from '@drizztdourden08/tessera/composites';
import { validateTag } from '../../files/validate-tag';
import { UPLOAD_TAG_PLACEHOLDER, UPLOAD_VERSION_HINT, UPLOAD_VERSION_PLACEHOLDER } from './FileMetaFields.constants';
import type { FileMetaFieldsProps } from './FileMetaFields.type';

const FileMetaFields = (props: FileMetaFieldsProps) => {
  const { variant, type, typeOptions, tags, knownTags, version, note } = props;
  const { onTypeChange, onTagsChange, onVersionChange, onNoteChange } = props;
  const upload = variant === 'upload';

  return (
    <>
      <Field label="Type">
        <Select
          value={type}
          onChange={(value) => onTypeChange(value as FileType)}
          options={typeOptions}
          size={upload ? undefined : 'sm'}
        />
      </Field>
      <TagInput
        label="Tags"
        value={tags}
        onChange={onTagsChange}
        suggestions={knownTags}
        validate={validateTag}
        enforce
        placeholder={upload ? UPLOAD_TAG_PLACEHOLDER : undefined}
      />
      <Field label="App version" hint={upload ? UPLOAD_VERSION_HINT : undefined}>
        <TextInput
          value={version}
          onChange={(event) => onVersionChange(event.target.value)}
          placeholder={upload ? UPLOAD_VERSION_PLACEHOLDER : undefined}
        />
      </Field>
      <Field label="Note" hint={`${note.length} / ${LIMITS.noteMaxChars}`}>
        <Textarea
          rows={2}
          maxLength={LIMITS.noteMaxChars}
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
        />
      </Field>
    </>
  );
};

export { FileMetaFields };
