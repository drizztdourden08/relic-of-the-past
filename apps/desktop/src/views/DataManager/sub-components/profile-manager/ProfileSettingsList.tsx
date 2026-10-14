/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { SETTINGS_SECTIONS } from './settings-sections.constants';
import { formatSettingValue } from './format-setting-value';
import type { ProfileSettingsListProps } from './ProfileDetailPanel.type';

const ProfileSettingsList = ({ settings }: ProfileSettingsListProps) => (
  <Box className="profile-detail__settings">
    {SETTINGS_SECTIONS.map((section) => (
      <Box key={section.title} className="detail-panel__section">
        <Text as="h4" className="detail-panel__section-title">{section.title}</Text>
        <Box className="profile-overview__settings">
          {section.keys.map(({ key, label, format }) => (
            <Box key={key} className="profile-overview__setting">
              <Text className="profile-overview__setting-label">{label}</Text>
              <Text className="profile-overview__setting-value">{formatSettingValue(settings[key], format)}</Text>
            </Box>
          ))}
        </Box>
      </Box>
    ))}
  </Box>
);

export { ProfileSettingsList };
