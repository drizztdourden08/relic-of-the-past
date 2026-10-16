/* @layer renderer-components @kind component */
import { Box, Callout, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { SETTINGS_SECTIONS } from '../settings-sections/settings-sections.constants';
import { formatSettingValue } from '../settings-sections/format-setting-value';
import { FactsSection } from './FactsSection';
import type { ProfileSettingsTabProps } from './profile-detail.type';

const ProfileSettingsTab = ({ settings }: ProfileSettingsTabProps) => {
  if (settings === null) return <Text variant="caption" tone="muted">This profile has no settings file yet.</Text>;

  return (
    <Stack gap="md">
      <Callout tone="info" variant="footnote">These are read only here. Change them in the game's Settings.</Callout>
      <Box className="profile-detail__grid">
        {SETTINGS_SECTIONS.map(({ title, keys }) => (
          <FactsSection
            key={title}
            title={title}
            facts={[keys.map(({ key, label, format }) => ({ label, value: formatSettingValue(settings[key], format) }))]}
          />
        ))}
      </Box>
    </Stack>
  );
};

export { ProfileSettingsTab };
