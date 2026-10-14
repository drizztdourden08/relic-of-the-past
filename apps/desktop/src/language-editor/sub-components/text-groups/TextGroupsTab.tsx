/* @layer renderer-components @kind component */
import { Box, Checkbox, EmptyState, ScrollArea, SectionHeader, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { TextGroupRail } from './TextGroupRail';
import { TextSlotRow } from './TextSlotRow';
import { useTextSlots } from './useTextSlots';
import type { TextGroupsTabProps } from './TextGroupsTab.type';
import './TextGroupsTab.css';

const TextGroupsTab = (props: TextGroupsTabProps) => {
  const { groups, activeGroup, values, readOnly = false, onSelectGroup, onChangeValue } = props;
  const slots = useTextSlots({ groups, activeGroup, values });
  const { group, matched, drawn, query, handleQuery, untranslatedOnly, setUntranslatedOnly, total, hidden, empty } = slots;

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
