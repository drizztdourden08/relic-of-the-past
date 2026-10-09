/* @layer renderer-components @kind component */
import { Box, Text, Status, Select, Button } from '@drizztdourden08/tessera/primitives';
import { formatRelativeTime } from '@drizztdourden08/brock-core';
import { updateProfile } from '../../../../../../../lib/storage/profile-store';
import { reloadMsuForProfile } from '@app/lib/game/msu-pack-loader';
import { languageLabel } from '../language-label';
import { IL } from './ProfileDetailPanel.constants';
import { SETTINGS_SECTIONS } from './settings-sections.constants';
import { formatSettingValue } from './format-setting-value';
import type { ProfileDetailPanelProps } from './ProfileDetailPanel.type';

const ProfileDetailPanel = (props: ProfileDetailPanelProps) => {
  const { profile, settings, languages, msuPacks, isGameRunning, onSelectProfile, onRefresh } = props;

  return (
    <Box style={IL.col}>
      <Text as="h3" className="detail-panel__title">
        {profile.name}
        {profile.automation && <Status tone="neutral">Agent</Status>}
      </Text>

      <Box className="profile-form" style={IL.mbMd}>
        <Box className="profile-form__field">
          <Text className="profile-form__label">Language</Text>
          <Select
            value={profile.language || ''}
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
            value={profile.msuPack || ''}
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

      <Box style={IL.actionRow}>
        <Button variant="primary" size="sm" onClick={() => onSelectProfile(profile)}>
          Open Profile
        </Button>
      </Box>

      <Box className="detail-panel__grid" style={IL.mbMd}>
        <Text className="detail-panel__label">ROM</Text>
        <Text className="detail-panel__value">{profile.romFile}</Text>
        <Text className="detail-panel__label">Language</Text>
        <Text className="detail-panel__value">{profile.language ? languageLabel(profile.language) : 'English (default)'}</Text>
        <Text className="detail-panel__label">MSU Pack</Text>
        <Text className="detail-panel__value">{profile.msuPack || 'None'}</Text>
        <Text className="detail-panel__label">Created</Text>
        <Text className="detail-panel__value">{new Date(profile.created).toLocaleDateString()}</Text>
        <Text className="detail-panel__label">Last Played</Text>
        <Text className="detail-panel__value">{formatRelativeTime(profile.lastPlayed)}</Text>
      </Box>

      {settings && (
        <Box style={IL.scroll}>
          {SETTINGS_SECTIONS.map((section) => (
            <Box key={section.title} className="detail-panel__section">
              <Text as="h4" className="detail-panel__section-title">{section.title}</Text>
              <Box className="profile-overview__settings">
                {section.keys.map(({ key, label, format }) => (
                  <Box key={key} className="profile-overview__setting">
                    <Text className="profile-overview__setting-label">{label}</Text>
                    <Text className="profile-overview__setting-value">{formatSettingValue((settings as Record<string, unknown>)[key], format)}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export { ProfileDetailPanel };
