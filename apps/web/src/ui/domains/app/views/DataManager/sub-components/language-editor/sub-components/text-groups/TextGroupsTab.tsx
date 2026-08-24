/* @layer renderer-components @kind component */
/**
 * The fixed-text tab: the groups on the left, the chosen group's slots as rows.
 *
 * These are the words the engine draws in fixed places rather than in a message
 * box — every one of them has a stated budget and a surface that may not be able
 * to draw every letter, so the row states both rather than letting a translator
 * find out from the running game.
 *
 * CAPPED, NOT VIRTUALIZED. One group runs to the high hundreds of slots and each
 * row holds a live field; drawing them all costs far more than a translator can
 * read at once. So a fixed number are drawn and the rest are stated plainly as
 * not drawn — the search is the way to them, which is also how anyone finds one
 * slot among hundreds anyway.
 *
 * Presentational. The groups, the chosen one and the words arrive from above and
 * every edit is reported back; the search and the toggle are this tab's own.
 */
import { useCallback, useMemo, useState } from 'react';
import { Box, Checkbox, EmptyState, ScrollArea, SectionHeader, Text, TextInput } from '@ds/primitives';
import { TextGroupRail } from './TextGroupRail';
import { TextSlotRow } from './TextSlotRow';
import { ROW_CAP, selectSlots } from './text-groups.model';
import type { ChangeEvent } from 'react';
import type { TextGroup, TextGroupId, TextSlot } from '@shared/game/language';
import './TextGroupsTab.css';

const NO_SLOTS: TextSlot[] = [];

type TextGroupsTabProps = {
  groups: TextGroup[];
  activeGroup: TextGroupId;
  /** The translator's overrides for the active group; missing key = untranslated. */
  values: Record<string, string>;
  onSelectGroup: (id: TextGroupId) => void;
  onChangeValue: (key: string, value: string) => void;
};

const TextGroupsTab = (props: TextGroupsTabProps) => {
  const { groups, activeGroup, values, onSelectGroup, onChangeValue } = props;

  const [query, setQuery] = useState('');
  const [untranslatedOnly, setUntranslatedOnly] = useState(false);

  const group = useMemo(
    () => groups.find((one) => one.id === activeGroup) ?? null,
    [groups, activeGroup],
  );

  const matched = useMemo(
    () => (group === null ? NO_SLOTS : selectSlots(group, values, { query, untranslatedOnly })),
    [group, values, query, untranslatedOnly],
  );

  const drawn = useMemo(() => matched.slice(0, ROW_CAP), [matched]);

  const handleQuery = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.currentTarget.value);
  }, []);

  const total = group?.slots.length ?? 0;
  const hidden = matched.length - drawn.length;
  const empty = group === null || total === 0;

  const search = (
    <TextInput
      value={query}
      onChange={handleQuery}
      placeholder="Search name, key or original…"
      aria-label="Search text slots"
    />
  );

  return (
    <Box className="text-groups-tab">
      <TextGroupRail
        groups={groups}
        activeGroup={activeGroup}
        values={values}
        onSelectGroup={onSelectGroup}
      />

      <Box className="text-groups-tab__panel">
        <SectionHeader title={`Showing ${matched.length} of ${total}`} action={search} />

        {group?.note && (
          <Text as="p" variant="caption" className="text-groups-tab__note">{group.note}</Text>
        )}

        <Box className="text-groups-tab__controls">
          <Checkbox
            checked={untranslatedOnly}
            onChange={setUntranslatedOnly}
            label="Untranslated only"
          />
        </Box>

        <ScrollArea className="text-groups-tab__rows">
          {empty && <EmptyState message="This group has no text to translate" />}
          {!empty && matched.length === 0 && <EmptyState message="No slot matches" />}

          {drawn.map((slot) => (
            <TextSlotRow
              key={slot.key}
              slot={slot}
              value={values[slot.key] ?? ''}
              onChangeValue={onChangeValue}
            />
          ))}

          {hidden > 0 && (
            <Text as="span" className="text-groups-tab__capped">
              {`${hidden} more match but are not drawn — search to narrow the list down to them.`}
            </Text>
          )}
        </ScrollArea>
      </Box>
    </Box>
  );
};

export { TextGroupsTab };
export type { TextGroupsTabProps };
