/* @layer renderer-components @kind component */
/**
 * Game Boy Advance tab — everything the second cartridge changes. Every difference row
 * is read-only reference material; the only interactive control is the Extra Dungeon
 * toggle at the top, which is itself gated on the supplement being imported.
 */
import { useCallback, useMemo, useState } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Toggle } from '../../../../../design-system/primitives/Toggle';
import { Field } from '../../../../../design-system/primitives/Field';
import { TextInput } from '../../../../../design-system/primitives/TextInput';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { SettingsSection } from '../../../../../design-system/composites/SettingsSection';
import { EmptyState } from '../../../../../design-system/primitives/EmptyState';
import { GbaDifferenceRow } from './gba-settings/GbaDifferenceRow';
import { useGbaAvailability } from './gba-settings/behavior/useGbaAvailability';
import { groupFilteredDifferences, type EvidenceFilter } from './gba-settings/group-differences';
import './gba-settings/GbaSettings.css';

const EVIDENCE_OPTIONS: { value: EvidenceFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'extracted', label: 'Extracted only' },
];

const EXTRA_DUNGEON_DESCRIPTION = 'Adds the optional post-game dungeon and its overworld entrance. Requires the second cartridge.';

interface GbaSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const GbaSettings = ({ settings, onChange }: GbaSettingsProps) => {
  const { hasSupplement } = useGbaAvailability();
  const [query, setQuery] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceFilter>('all');

  const handleExtraDungeonChange = useCallback(
    (extraDungeon: boolean) => onChange({ extraDungeon }),
    [onChange],
  );

  const groups = useMemo(() => groupFilteredDifferences(query, evidenceFilter), [query, evidenceFilter]);

  const extraDungeonDescription = hasSupplement
    ? EXTRA_DUNGEON_DESCRIPTION
    : `${EXTRA_DUNGEON_DESCRIPTION} Import the second cartridge before this can be turned on.`;

  return (
    <Box className="gba-settings">
      <Toggle
        label="Extra Dungeon"
        description={extraDungeonDescription}
        checked={settings.extraDungeon}
        onChange={handleExtraDungeonChange}
        disabled={!hasSupplement}
      />

      <Box className="gba-settings__catalogue">
        <Text as="p" className="gba-settings__note">
          Everything below is documented for reference — none of these individual
          differences are switchable yet.
        </Text>

        <Box className="gba-settings__filters">
          <Field label="Search" htmlFor="gba-settings-search" className="gba-settings__search-field">
            <TextInput
              id="gba-settings-search"
              type="text"
              placeholder="Search differences…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Field>
          <SegmentedControl
            value={evidenceFilter}
            options={EVIDENCE_OPTIONS}
            onChange={setEvidenceFilter}
            label="Evidence"
          />
        </Box>

        {groups.length === 0 && <EmptyState message={`No differences match "${query}"`} />}

        {groups.map(({ group, rows }) => (
          <SettingsSection key={group} title={group}>
            {rows.map((row) => (
              <GbaDifferenceRow key={row.id} difference={row} />
            ))}
          </SettingsSection>
        ))}
      </Box>
    </Box>
  );
};

export { GbaSettings };
export type { GbaSettingsProps };
