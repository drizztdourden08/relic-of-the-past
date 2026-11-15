/* @layer renderer-components @kind component */
import { Field, Grid, SegmentedControl, Select, Stack, TextInput } from '@drizztdourden08/tessera/primitives';
import { DEFAULT_LANGUAGE_LABEL, NO_MSU_LABEL, PRESET_OPTIONS } from '../../ProfileCreateWizard.constants';
import type { ProfileStepProps } from './ProfileStep.type';

const ProfileStep = ({ values, update, readyRoms, languages, msuPacks }: ProfileStepProps) => (
  <Stack gap="md">
    <Grid columns={2} gap="md">
      <Field label="Profile Name">
        <TextInput type="text" placeholder="My Profile" value={values.name} onChange={(e) => update({ name: e.target.value })} />
      </Field>
      <Field label="ROM">
        <Select
          value={values.rom}
          onChange={(rom) => update({ rom })}
          options={readyRoms.map((r) => ({ value: r.romFile, label: r.romFile }))}
          placeholder="Select ROM..."
        />
      </Field>
    </Grid>
    <SegmentedControl label="Preset" value={values.preset} options={PRESET_OPTIONS} onChange={(preset) => update({ preset })} />
    <Grid columns={2} gap="md">
      <Field label="Language">
        <Select
          value={values.language}
          onChange={(language) => update({ language })}
          options={[{ value: '', label: DEFAULT_LANGUAGE_LABEL }, ...languages.map((l) => ({ value: l.code, label: l.code }))]}
          placeholder={DEFAULT_LANGUAGE_LABEL}
        />
      </Field>
      <Field label="MSU Pack">
        <Select
          value={values.msuPack}
          onChange={(msuPack) => update({ msuPack })}
          options={[{ value: '', label: NO_MSU_LABEL }, ...msuPacks.map((p) => ({ value: p.name, label: p.name }))]}
          placeholder={NO_MSU_LABEL}
        />
      </Field>
    </Grid>
  </Stack>
);

export { ProfileStep };
