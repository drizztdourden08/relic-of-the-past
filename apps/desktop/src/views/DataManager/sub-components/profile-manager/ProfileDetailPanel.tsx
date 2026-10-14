/* @layer renderer-components @kind component */
import { Box, Text, Status, Button } from '@drizztdourden08/tessera/primitives';
import { formatRelativeTime } from '@drizztdourden08/brock-core';
import { languageLabel } from '../language-label';
import { msuLabelOf } from './msu-label-of';
import { ProfilePicks } from './ProfilePicks';
import { ProfileSettingsList } from './ProfileSettingsList';
import type { ProfileDetailPanelProps } from './ProfileDetailPanel.type';
import './ProfileDetailPanel.css';

const ProfileDetailPanel = (props: ProfileDetailPanelProps) => {
  const { profile, settings, languages, msuPacks, onSelectProfile, onRefresh } = props;

  return (
    <Box className="profile-detail">
      <Text as="h3" className="detail-panel__title">
        {profile.name}
        {profile.automation && <Status tone="neutral">Agent</Status>}
      </Text>

      <ProfilePicks profile={profile} languages={languages} msuPacks={msuPacks} onRefresh={onRefresh} />

      <Box className="profile-detail__actions">
        <Button variant="primary" size="sm" onClick={() => onSelectProfile(profile)}>
          Open Profile
        </Button>
      </Box>

      <Box className="detail-panel__grid profile-detail__spaced">
        <Text className="detail-panel__label">ROM</Text>
        <Text className="detail-panel__value">{profile.romFile}</Text>
        <Text className="detail-panel__label">Language</Text>
        <Text className="detail-panel__value">{profile.language ? languageLabel(profile.language) : 'English (default)'}</Text>
        <Text className="detail-panel__label">MSU Pack</Text>
        <Text className="detail-panel__value">{msuLabelOf(profile.msuPack)}</Text>
        <Text className="detail-panel__label">Created</Text>
        <Text className="detail-panel__value">{new Date(profile.created).toLocaleDateString()}</Text>
        <Text className="detail-panel__label">Last Played</Text>
        <Text className="detail-panel__value">{formatRelativeTime(profile.lastPlayed)}</Text>
      </Box>

      {settings && <ProfileSettingsList settings={settings} />}
    </Box>
  );
};

export { ProfileDetailPanel };
