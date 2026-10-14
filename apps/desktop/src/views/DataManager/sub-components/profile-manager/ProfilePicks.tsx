/* @layer renderer-components @kind component */
import { Box, Text, Select } from '@drizztdourden08/tessera/primitives';
import { updateProfile } from '../../../../storage/profile-store';
import { reloadMsuForProfile } from '@app/game/msu-pack-loader';
import { languageLabel } from '../language-label';
import type { ProfilePicksProps } from './ProfileDetailPanel.type';

const ProfilePicks = (props: ProfilePicksProps) => {
  const { profile, languages, msuPacks, onRefresh } = props;

  return (
    <Box className="profile-form profile-detail__spaced">
      <Box className="profile-form__field">
        <Text className="profile-form__label">Language</Text>
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
      </Box>
      <Box className="profile-form__field">
        <Text className="profile-form__label">MSU Pack</Text>
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
      </Box>
    </Box>
  );
};

export { ProfilePicks };
