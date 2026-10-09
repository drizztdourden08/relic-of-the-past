/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { Box, SearchInput } from '@drizztdourden08/tessera/primitives';
import { ListItemList, ListItemRow } from '@drizztdourden08/tessera/composites';
import { POSE_ATLAS, facingsOf, framesOf } from '@rotp/game-data';
import { STATE_LABELS, GROUP_LABELS, labelFor } from '@rotp/game-data';
import { GROUP_ORDER, ROW_SHAPE } from './StateList.constants';
import type { StateListProps } from './StateList.type';
import './StateList.css';

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
      <SearchInput
        value={filter}
        onChange={setFilter}
        placeholder={`Filter ${STATE_LABELS.length} states...`}
      />
      <Box className="state-list__scroll">
        {grouped.map(({ group, items }) => (
          <ListItemList key={group} heading={GROUP_LABELS[group]} count={items.length} shape={ROW_SHAPE}>
            {items.map(({ state, meta }) => {
              const total = facingsOf(state).reduce<number>((n, f) => n + framesOf(state, f).length, 0);
              return (
                <ListItemRow
                  key={state.action}
                  name={meta.label}
                  columns={[{ primary: total, align: 'end' }]}
                  selected={selected === state.action}
                  onClick={() => onSelect(state.action)}
                />
              );
            })}
          </ListItemList>
        ))}
      </Box>
    </Box>
  );
};

export { StateList };
