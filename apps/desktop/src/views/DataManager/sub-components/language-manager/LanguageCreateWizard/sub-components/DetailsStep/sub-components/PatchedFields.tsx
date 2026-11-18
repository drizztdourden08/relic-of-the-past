/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Field, Stack, TextInput } from '@drizztdourden08/tessera/primitives';
import { officialRomStatuses } from '@rotp/roms';
import { UploadField } from '@app/compounds/UploadField';
import { PATCHED_ROM_ACCEPT } from '../../../LanguageCreateWizard.constants';
import { checkPickedRom, romCheckStatus } from '../../../../../rom-check';
import type { SourceFieldsProps } from '../DetailsStep.type';
import { ReleaseSelect } from './ReleaseSelect';
import { TextOrFileField } from './TextOrFileField';

const PatchedFields = ({ values, update }: SourceFieldsProps) => {
  const t = useT();
  const text = useText();
  return (
  <Stack gap="md">
    <Field label={t('wizards:language.details.name')} hint={t('wizards:language.details.type-the-language-this-rom')}>
      <TextInput value={values.name} onChange={(e) => update({ name: e.currentTarget.value })} placeholder={t('wizards:language.details.italian-fan-translation')} />
    </Field>
    <Field label={t('wizards:language.details.based-on')} hint={t('wizards:language.details.the-official-release-the-fan')}>
      <ReleaseSelect value={values.release} onChange={(release) => update({ release })} />
    </Field>
    <TextOrFileField
      label={t('wizards:language.details.license')}
      hint={t('wizards:language.details.optional-the-license-of-the')}
      dropLabel={t('wizards:language.details.drop-the-license-file')}
      value={values.license}
      onChange={(license) => update({ license })}
    />
    <TextOrFileField
      label={t('wizards:language.details.notes-credits')}
      hint={t('wizards:language.details.optional-who-made-the-translation')}
      dropLabel={t('wizards:language.details.drop-the-notes-or-credits')}
      value={values.credits}
      onChange={(credits) => update({ credits })}
    />
    <Field label={t('wizards:language.details.rom-file')}>
      <UploadField
        accept={PATCHED_ROM_ACCEPT}
        label={t('wizards:language.details.drop-the-patched-rom')}
        hint={t('wizards:language.details.the-rom-is-read-never')}
        status={romCheckStatus(values.patchedFile, values.patchedCheck, t)}
        roms={officialRomStatuses()}
        onFiles={(files) => checkPickedRom({
          files, mode: 'patched', expected: undefined, text,
          on: { file: (patchedFile) => update({ patchedFile, patchedCheck: null }), check: (patchedCheck) => update({ patchedCheck }) },
        })}
      />
    </Field>
  </Stack>
  );
};

export { PatchedFields };
