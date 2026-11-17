/* @layer renderer-components @kind component */
import { DropZone, Field, Stack, TextInput } from '@drizztdourden08/tessera/primitives';
import { PATCHED_ROM_ACCEPT } from '../../../LanguageCreateWizard.constants';
import { chosenStatus } from '../../../behavior/chosen-status';
import type { SourceFieldsProps } from '../DetailsStep.type';
import { ReleaseSelect } from './ReleaseSelect';
import { TextOrFileField } from './TextOrFileField';

const PatchedFields = ({ values, update }: SourceFieldsProps) => (
  <Stack gap="md">
    <Field label="Name" hint="Type the language this ROM holds. The set id is made from the name.">
      <TextInput value={values.name} onChange={(e) => update({ name: e.currentTarget.value })} placeholder="Italian fan translation" />
    </Field>
    <Field label="Based on" hint="The official release the fan patch was applied to">
      <ReleaseSelect value={values.release} onChange={(release) => update({ release })} />
    </Field>
    <TextOrFileField
      label="License"
      hint="Optional: the license of the original translation, kept as it is"
      dropLabel="Drop the license file"
      value={values.license}
      onChange={(license) => update({ license })}
    />
    <TextOrFileField
      label="Notes / Credits"
      hint="Optional: who made the translation, and any notes"
      dropLabel="Drop the notes or credits file"
      value={values.credits}
      onChange={(credits) => update({ credits })}
    />
    <Field label="ROM file">
      <DropZone
        accept={PATCHED_ROM_ACCEPT}
        variant="inline"
        label="Drop the patched ROM"
        hint="The ROM is read, never saved."
        status={chosenStatus(values.patchedFile)}
        onDrop={(files) => update({ patchedFile: files[0] ?? null })}
      />
    </Field>
  </Stack>
);

export { PatchedFields };
