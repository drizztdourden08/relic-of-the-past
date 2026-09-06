/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { Button } from '@ds/primitives/Button';
import { POSE_ATLAS, facingsOf, framesOf } from '@shared/game/data/native-tables/player-pose-atlas';
import { STATE_LABELS, GROUP_LABELS, labelFor } from '@shared/game/data/native-tables/player-state-labels';
import type { StateGroup } from '@shared/game/data/native-tables/player-state-labels';

interface StateListProps {
  selected: number;
  onSelect: (action: number) => void;
}

const GROUP_ORDER: readonly StateGroup[] = ['movement', 'combat', 'carrying', 'water', 'hazard', 'special'];

/** Every action the engine can draw, grouped and filterable. */
const StateList = (props: StateListProps) => {
  const { selected, onSelect } = props;
  const [filter, setFilter] = useState('');

  const grouped = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const rows = POSE_ATLAS.states
      .map((state) => ({ state, meta: labelFor(state.action) }))
      .filter(({ meta }) => !needle || meta.label.toLowerCase().includes(needle));
    return GROUP_ORDER
      .map((group) => ({ group, items: rows.filter(({ meta }) => meta.group === group) }))
      .filter(({ items }) => items.length > 0);
  }, [filter]);

  return (
    <Box className="state-list">
      <TextInput
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder={`Filter ${STATE_LABELS.length} states...`}
      />
      <Box className="state-list__scroll">
        {grouped.map(({ group, items }) => (
          <Box key={group}>
            <Text className="state-list__group">{GROUP_LABELS[group]}</Text>
            {items.map(({ state, meta }) => {
              const total = facingsOf(state).reduce<number>((n, f) => n + framesOf(state, f).length, 0);
              return (
                <Button
                  key={state.action}
                  variant="bare"
                  className={`state-list__item${selected === state.action ? ' state-list__item--active' : ''}`}
                  onClick={() => onSelect(state.action)}
                >
                  <Text as="span" className="state-list__name">{meta.label}</Text>
                  <Text as="span" className="state-list__count">{total}</Text>
                </Button>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { StateList };
export type { StateListProps };
