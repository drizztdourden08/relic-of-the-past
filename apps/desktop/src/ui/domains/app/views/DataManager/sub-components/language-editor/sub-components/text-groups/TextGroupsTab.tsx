/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { Box, Checkbox, EmptyState, ScrollArea, SectionHeader, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { TextGroupRail } from './TextGroupRail';
import { TextSlotRow } from './TextSlotRow';
import { selectSlots } from './select-slots';
import { ROW_CAP } from './text-groups.constants';
import { NO_SLOTS } from './TextGroupsTab.constants';
import type { ChangeEvent } from 'react';
import type { TextGroupsTabProps } from './TextGroupsTab.type';
import './TextGroupsTab.css';

const TextGroupsTab = (props: TextGroupsTabProps) => {
  const { groups, activeGroup, values, readOnly = false, onSelectGroup, onChangeValue } = props;

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
      placeholder="Search name, key or original..."
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
              readOnly={readOnly}
              onChangeValue={onChangeValue}
            />
          ))}

          {hidden > 0 && (
            <Text as="span" className="text-groups-tab__capped">
              {`${hidden} more match but are not drawn. Search to narrow the list down to them.`}
            </Text>
          )}
        </ScrollArea>
      </Box>
    </Box>
  );
};

export { TextGroupsTab };
