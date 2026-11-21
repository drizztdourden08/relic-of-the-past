/* @layer renderer-components @kind component */
import { Box, Checkbox, EmptyState, ScrollArea, SectionHeader, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { TextGroupRail } from './TextGroupRail';
import { TextSlotRow } from './TextSlotRow';
import { useTextSlots } from './useTextSlots';
import type { TextGroupsTabProps } from './TextGroupsTab.type';
import './TextGroupsTab.css';

const TextGroupsTab = (props: TextGroupsTabProps) => {
  const { groups, activeGroup, values, readOnly = false, onSelectGroup, onChangeValue } = props;
  const t = useT();
  const slots = useTextSlots({ groups, activeGroup, values });
  const { group, matched, drawn, query, handleQuery, untranslatedOnly, setUntranslatedOnly, total, hidden, empty } = slots;

  const search = (
    <TextInput
      value={query}
      onChange={handleQuery}
      placeholder={t('language-editor:groups.search-placeholder')}
      aria-label={t('language-editor:groups.search-label')}
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
        <SectionHeader title={t('language-editor:groups.showing', { shown: matched.length, total })} action={search} />

        {group?.note && (
          <Text as="p" variant="caption" className="text-groups-tab__note">{group.note}</Text>
        )}

        <Box className="text-groups-tab__controls">
          <Checkbox
            checked={untranslatedOnly}
            onChange={setUntranslatedOnly}
            label={t('language-editor:groups.untranslated-only')}
          />
        </Box>

        <ScrollArea className="text-groups-tab__rows">
          {empty && <EmptyState message={t('language-editor:groups.empty')} />}
          {!empty && matched.length === 0 && <EmptyState message={t('language-editor:groups.no-match')} />}

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
              {t('language-editor:groups.capped', { count: hidden })}
            </Text>
          )}
        </ScrollArea>
      </Box>
    </Box>
  );
};

export { TextGroupsTab };
