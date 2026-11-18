/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Toggle } from '@drizztdourden08/tessera/primitives';
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import { SearchAnchor, useT } from '@drizztdourden08/brock-react';
import { GbaDifferenceTable } from './GbaDifferenceTable';
import { useGbaAvailability } from './behavior/useGbaAvailability';
import type { GbaSettingsProps } from './gba-settings.type';
import './GbaSettings.css';

const GbaSettings = ({ settings, onChange }: GbaSettingsProps) => {
  const t = useT();
  const { hasSupplement } = useGbaAvailability();

  const handleExtraDungeonChange = useCallback(
    (extraDungeon: boolean) => onChange({ extraDungeon }),
    [onChange],
  );

  const extraDungeonDescription = hasSupplement
    ? t('profiles:gba.extra-dungeon.description')
    : t('profiles:gba.extra-dungeon.description-missing');

  return (
    <Box className="gba-settings">
      <SettingsSection title={t('profiles:gba.enable')}>
        <SearchAnchor anchor="extraDungeon">
          <Toggle
            label={t('profiles:gba.extra-dungeon.label')}
            description={extraDungeonDescription}
            checked={settings.extraDungeon}
            onChange={handleExtraDungeonChange}
            disabled={!hasSupplement}
          />
        </SearchAnchor>
      </SettingsSection>

      <SearchAnchor anchor="gba-differences">
        <SettingsSection title={t('profiles:gba.tracker')}>
          <GbaDifferenceTable />
        </SettingsSection>
      </SearchAnchor>
    </Box>
  );
};

export { GbaSettings };
