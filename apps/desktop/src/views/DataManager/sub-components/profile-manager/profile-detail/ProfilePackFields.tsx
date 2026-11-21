/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Field, Select } from '@drizztdourden08/tessera/primitives';
import { reloadMsuForProfile } from '@app/game/msu-pack-loader';
import { updateProfile } from '@app/storage/profile-store';
import { languageOptions } from '../../language-options';
import { shownLanguage } from '../../shown-language';
import type { ProfileEditSectionProps } from './profile-detail.type';

const ProfilePackFields = (props: ProfileEditSectionProps) => {
  const t = useT();
  const { profile, languages, msuPacks, onRefresh } = props;

  return (
    <>
      <Field label={t('data-manager:profile-manager.profile-pack-fields.language')}>
        <Select
          value={shownLanguage(profile.language)}
          onChange={async (val) => {
            await updateProfile(profile.id, { language: val || null });
            onRefresh();
          }}
          options={languageOptions(languages, t)}
        />
      </Field>
      <Field label={t('data-manager:profile-manager.profile-pack-fields.msu-pack')}>
        <Select
          value={profile.msuPack ?? ''}
          onChange={async (val) => {
            await updateProfile(profile.id, { msuPack: val || null });
            await reloadMsuForProfile(profile.id);
            onRefresh();
          }}
          options={[
            { value: '', label: t('data-manager:profile-manager.profile-pack-fields.none') },
            ...msuPacks.map((p) => ({ value: p.name, label: p.name })),
          ]}
          placeholder={t('data-manager:profile-manager.profile-pack-fields.none')}
        />
      </Field>
    </>
  );
};

export { ProfilePackFields };
