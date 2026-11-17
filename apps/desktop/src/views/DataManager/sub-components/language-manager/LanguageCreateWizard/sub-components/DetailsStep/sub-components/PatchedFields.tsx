/* @layer renderer-components @kind component */
import { DropZone, Field, Select, Stack, TextInput, Textarea } from '@drizztdourden08/tessera/primitives';
import type { RomLanguage } from '@rotp/asset-extraction';
import { PATCHED_ROM_ACCEPT, RELEASE_OPTIONS } from '../../../LanguageCreateWizard.constants';
import { chosenStatus } from '../../../behavior/chosen-status';
import type { SourceFieldsProps } from '../DetailsStep.type';

const PatchedFields = ({ values, update }: SourceFieldsProps) => (
  <Stack gap="md">
    <Field label="Name" hint="Type the language this ROM holds. The set id is made from the name.">
      <TextInput value={values.name} onChange={(e) => update({ name: e.currentTarget.value })} placeholder="Italian fan translation" />
    </Field>
    <Field label="Based on" hint="The release the fan patch was applied to">
      <Select value={values.release} onChange={(release) => update({ release: release as RomLanguage })} options={[...RELEASE_OPTIONS]} />
    </Field>
    <Field label="Credits" hint="Optional: who made the translation">
      <Textarea value={values.credits} onChange={(e) => update({ credits: e.currentTarget.value })} rows={2} resize="vertical" />
    </Field>
    <Field label="ROM file">
      <DropZone
        accept={PATCHED_ROM_ACCEPT}
        variant="inline"
        label={values.patchedFile?.name ?? 'Drop the patched ROM'}
        hint="The ROM is read, never saved."
        status={chosenStatus(values.patchedFile)}
        onDrop={(files) => update({ patchedFile: files[0] ?? null })}
      />
    </Field>
  </Stack>
);

export { PatchedFields };
