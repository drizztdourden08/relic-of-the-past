/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Callout, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { SETTINGS_SECTIONS } from '../settings-sections/settings-sections.constants';
import { formatSettingValue } from '../settings-sections/format-setting-value';
import { FactsSection } from './FactsSection';
import type { ProfileSettingsTabProps } from './profile-detail.type';

const ProfileSettingsTab = ({ settings }: ProfileSettingsTabProps) => {
  const t = useT();
  if (settings === null) return <Text variant="caption" tone="muted">{t('data-manager:profile-manager.profile-settings-tab.no-settings-saved-yet')}</Text>;

  return (
    <Stack gap="md">
      <Callout tone="info" variant="footnote">{t('data-manager:profile-manager.profile-settings-tab.read-only-change-these-in')}</Callout>
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
