/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Toggle } from '@drizztdourden08/tessera/primitives';
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import { SearchAnchor } from '@drizztdourden08/brock-react';
import { GbaDifferenceTable } from './GbaDifferenceTable';
import { useGbaAvailability } from './behavior/useGbaAvailability';
import { EXTRA_DUNGEON_DESCRIPTION } from './gba-settings.constants';
import type { GbaSettingsProps } from './gba-settings.type';
import './GbaSettings.css';

const GbaSettings = ({ settings, onChange }: GbaSettingsProps) => {
  const { hasSupplement } = useGbaAvailability();

  const handleExtraDungeonChange = useCallback(
    (extraDungeon: boolean) => onChange({ extraDungeon }),
    [onChange],
  );

  const extraDungeonDescription = hasSupplement
    ? EXTRA_DUNGEON_DESCRIPTION
    : `${EXTRA_DUNGEON_DESCRIPTION} Import the second cartridge before this can be turned on.`;

  return (
    <Box className="gba-settings">
      <SettingsSection title="Enable">
        <SearchAnchor anchor="extraDungeon">
          <Toggle
            label="Extra Dungeon"
            description={extraDungeonDescription}
            checked={settings.extraDungeon}
            onChange={handleExtraDungeonChange}
            disabled={!hasSupplement}
          />
        </SearchAnchor>
      </SettingsSection>

      <SearchAnchor anchor="gba-differences">
        <SettingsSection title="Advancement tracker">
          <GbaDifferenceTable />
        </SettingsSection>
      </SearchAnchor>
    </Box>
  );
};

export { GbaSettings };
