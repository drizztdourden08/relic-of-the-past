/* @layer renderer-components @kind component */
import { Box, Text, Select, TextInput, Field, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { useSettings } from '@drizztdourden08/brock-react';
import { experimentalFeaturesEnabled } from '@rotp/features';
import type { AppSettings } from '@app/settings.type';
import { ProfileCreateActions } from './ProfileCreateActions';
import { RandomizerFields } from './RandomizerFields';
import type { ProfileCreateFormProps } from './profile-manager.type';

const ProfileCreateForm = (props: ProfileCreateFormProps) => {
  const { settings } = useSettings<AppSettings>();
  const { form, readyRoms, languages, msuPacks, onKeyDown, onCancel, onCreate } = props;
  const {
    formName, setFormName, formRom, setFormRom, formLang, setFormLang, formMsu, setFormMsu,
    formRandomizer, setFormRandomizer, formPreset, formError, formJoining, handlePickPreset,
  } = form;

  return (
    <Box className="profile-form" onKeyDown={onKeyDown}>
      <Field label="Profile Name">
        <TextInput type="text" placeholder="My Profile" value={formName} onChange={(e) => setFormName(e.target.value)} autoFocus />
      </Field>
      <Field label="ROM">
        <Select
          value={formRom}
          onChange={(val) => setFormRom(val)}
          options={readyRoms.map((r) => ({ value: r.romFile, label: r.romFile }))}
          placeholder="Select ROM..."
        />
      </Field>
      <SegmentedControl
        label="Preset"
        value={formPreset}
        onChange={handlePickPreset}
        options={[
          { value: 'vanilla', label: 'Vanilla' },
          { value: 'enhanced', label: 'Enhanced' },
        ]}
      />
      <Field label="Language">
        <Select
          value={formLang}
          onChange={(val) => setFormLang(val)}
          options={[
            { value: '', label: 'Default (English)' },
            ...languages.map((l) => ({ value: l.code, label: l.code })),
          ]}
          placeholder="Default (English)"
        />
      </Field>
      <Field label="MSU Pack">
        <Select
          value={formMsu}
          onChange={(val) => setFormMsu(val)}
          options={[
            { value: '', label: 'None' },
            ...msuPacks.map((p) => ({ value: p.name, label: p.name })),
          ]}
          placeholder="None"
        />
      </Field>
      <RandomizerFields
        value={formRandomizer} onChange={setFormRandomizer} experimental={experimentalFeaturesEnabled(settings)} joining={formJoining !== null}
      />
      {formError && <Text variant="caption" className="profile-form__error">{formError}</Text>}
      <ProfileCreateActions form={form} onCancel={onCancel} onCreate={onCreate} />
    </Box>
  );
};

export { ProfileCreateForm };
