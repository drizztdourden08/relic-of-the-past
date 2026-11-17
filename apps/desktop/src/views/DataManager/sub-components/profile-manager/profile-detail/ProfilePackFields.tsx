/* @layer renderer-components @kind component */
import { Field, Select } from '@drizztdourden08/tessera/primitives';
import { reloadMsuForProfile } from '@app/game/msu-pack-loader';
import { updateProfile } from '@app/storage/profile-store';
import { languageOptions } from '../../language-options';
import { shownLanguage } from '../../shown-language';
import type { ProfileEditSectionProps } from './profile-detail.type';

const ProfilePackFields = (props: ProfileEditSectionProps) => {
  const { profile, languages, msuPacks, onRefresh } = props;

  return (
    <>
      <Field label="Language">
        <Select
          value={shownLanguage(profile.language)}
          onChange={async (val) => {
            await updateProfile(profile.id, { language: val || null });
            onRefresh();
          }}
          options={languageOptions(languages)}
        />
      </Field>
      <Field label="MSU pack">
        <Select
          value={profile.msuPack ?? ''}
          onChange={async (val) => {
            await updateProfile(profile.id, { msuPack: val || null });
            await reloadMsuForProfile(profile.id);
            onRefresh();
          }}
          options={[
            { value: '', label: 'None' },
            ...msuPacks.map((p) => ({ value: p.name, label: p.name })),
          ]}
          placeholder="None"
        />
      </Field>
    </>
  );
};

export { ProfilePackFields };
