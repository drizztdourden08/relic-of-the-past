/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Field, Grid, SegmentedControl, Select, Stack, TextInput } from '@drizztdourden08/tessera/primitives';
import { languageOptions } from '../../../../language-options';
import { shownLanguage } from '../../../../shown-language';
import { presetOptions } from '../../ProfileCreateWizard.constants';
import type { ProfileStepProps } from './ProfileStep.type';

const ProfileStep = ({ values, update, readyRoms, languages, msuPacks }: ProfileStepProps) => {
  const t = useT();
  return (
  <Stack gap="md">
    <Grid columns={2} gap="md">
      <Field label={t('wizards:profile.profile.profile-name')}>
        <TextInput type="text" placeholder={t('wizards:profile.profile.my-profile')} value={values.name} onChange={(e) => update({ name: e.target.value })} />
      </Field>
      <Field label={t('wizards:profile.profile.rom')}>
        <Select
          value={values.rom}
          onChange={(rom) => update({ rom })}
          options={readyRoms.map((r) => ({ value: r.romFile, label: r.romFile }))}
          placeholder={t('wizards:profile.profile.select-rom')}
        />
      </Field>
    </Grid>
    <SegmentedControl label={t('wizards:profile.profile.preset')} value={values.preset} options={presetOptions(t)} onChange={(preset) => update({ preset })} />
    <Grid columns={2} gap="md">
      <Field label={t('wizards:profile.profile.language')}>
        <Select
          value={shownLanguage(values.language)}
          onChange={(language) => update({ language })}
          options={languageOptions(languages, t)}
        />
      </Field>
      <Field label={t('wizards:profile.profile.msu-pack')}>
        <Select
          value={values.msuPack}
          onChange={(msuPack) => update({ msuPack })}
          options={[{ value: '', label: t('wizards:profile.none') }, ...msuPacks.map((p) => ({ value: p.name, label: p.name }))]}
          placeholder={t('wizards:profile.none')}
        />
      </Field>
    </Grid>
  </Stack>
  );
};

export { ProfileStep };
