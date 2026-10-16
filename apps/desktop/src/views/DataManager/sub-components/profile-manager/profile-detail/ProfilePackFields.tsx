/* @layer renderer-components @kind component */
import { Field, Select } from '@drizztdourden08/tessera/primitives';
import { reloadMsuForProfile } from '@app/game/msu-pack-loader';
import { updateProfile } from '@app/storage/profile-store';
import { languageLabel } from '../../language-label';
import type { ProfileEditSectionProps } from './profile-detail.type';

const ProfilePackFields = (props: ProfileEditSectionProps) => {
  const { profile, languages, msuPacks, onRefresh } = props;

  return (
    <>
      <Field label="Language" hint="The text the game shows.">
        <Select
          value={profile.language ?? ''}
          onChange={async (val) => {
            await updateProfile(profile.id, { language: val || null });
            onRefresh();
          }}
          options={[
            { value: '', label: 'Default (English)' },
            ...languages.map((l) => ({ value: l.code, label: languageLabel(l.code) })),
          ]}
          placeholder="Default (English)"
        />
      </Field>
      <Field label="MSU pack" hint="Plays at once when this profile is running.">
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
