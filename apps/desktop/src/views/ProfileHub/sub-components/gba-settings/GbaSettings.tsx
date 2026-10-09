/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Box, Text, Toggle, Field, TextInput, SegmentedControl, EmptyState } from '@drizztdourden08/tessera/primitives';
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import { SearchAnchor } from '@drizztdourden08/brock-react';
import { GbaDifferenceRow } from './GbaDifferenceRow';
import { useGbaAvailability } from './behavior/useGbaAvailability';
import { groupFilteredDifferences } from './group-differences';
import { EVIDENCE_OPTIONS, EXTRA_DUNGEON_DESCRIPTION } from './gba-settings.constants';
import type { EvidenceFilter, GbaSettingsProps } from './gba-settings.type';
import './GbaSettings.css';

const GbaSettings = ({ settings, onChange }: GbaSettingsProps) => {
  const { hasSupplement } = useGbaAvailability();
  const [query, setQuery] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceFilter>('all');

  const handleExtraDungeonChange = useCallback(
    (extraDungeon: boolean) => onChange({ extraDungeon }),
    [onChange],
  );
  const handleQueryChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value), []);

  const groups = useMemo(() => groupFilteredDifferences(query, evidenceFilter), [query, evidenceFilter]);

  const extraDungeonDescription = hasSupplement
    ? EXTRA_DUNGEON_DESCRIPTION
    : `${EXTRA_DUNGEON_DESCRIPTION} Import the second cartridge before this can be turned on.`;

  return (
    <Box className="gba-settings">
      <SearchAnchor anchor="extraDungeon">
        <Toggle
          label="Extra Dungeon"
          description={extraDungeonDescription}
          checked={settings.extraDungeon}
          onChange={handleExtraDungeonChange}
          disabled={!hasSupplement}
        />
      </SearchAnchor>

      <SearchAnchor anchor="gba-differences" className="gba-settings__catalogue">
        <Text as="p" className="gba-settings__note">
          Everything below is documented for reference. None of these differences
          can be switched on or off yet.
        </Text>

        <Box className="gba-settings__filters">
          <Field label="Search" htmlFor="gba-settings-search" className="gba-settings__search-field">
            <TextInput
              id="gba-settings-search"
              type="text"
              placeholder="Search differences..."
              value={query}
              onChange={handleQueryChange}
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
      </SearchAnchor>
    </Box>
  );
};

export { GbaSettings };
export type { GbaSettingsProps };
