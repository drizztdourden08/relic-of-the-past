/* @layer renderer-components @kind component */
/**
 * Profile detail panel — right-side display of selected profile info + settings.
 */

import type { CSSProperties } from 'react';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Select } from '../../../../../../design-system/primitives/Select';
import { Button } from '../../../../../../design-system/primitives/Button';
import { formatRelativeTime } from '../../../../../../../utils';
import { updateProfile } from '../../../../../../../lib/storage/profile-store';
import { languageLabel } from '../language-names';

const IL: Record<string, CSSProperties> = {
  col: { display: 'flex', flexDirection: 'column', height: '100%' },
  mbMd: { marginBottom: 'var(--space-md)' },
  actionRow: { display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' },
  scroll: { flex: 1, overflow: 'auto', marginTop: 'var(--space-xs)' },
};
import { formatSettingValue, SETTINGS_SECTIONS } from './settings-sections';

interface ProfileDetailPanelProps {
  profile: Profile;
  settings: Record<string, unknown> | null;
  languages: Array<{ code: string }>;
  msuPacks: Array<{ name: string }>;
  isGameRunning: boolean;
  onSelectProfile: (profile: Profile) => void;
  onRefresh: () => void;
}

const ProfileDetailPanel = (props: ProfileDetailPanelProps) => {
  const { profile, settings, languages, msuPacks, isGameRunning, onSelectProfile, onRefresh } = props;

  return (
    <Box style={IL.col}>
      <Text as="h3" className="detail-panel__title">{profile.name}</Text>

      <Box className="profile-form" style={IL.mbMd}>
        <Box className="profile-form__field">
          <Text className="profile-form__label">Language</Text>
          <Select
            value={profile.language || ''}
            onChange={async (val) => {
              await window.api.updateProfile(profile.id, { language: val || undefined });
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
              await window.api.updateProfile(profile.id, { msuPack: val || undefined });
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
export type { ProfileDetailPanelProps };
