/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { Box, SearchInput } from '@drizztdourden08/tessera/primitives';
import { ListItemList, ListItemRow } from '@drizztdourden08/tessera/composites';
import { POSE_ATLAS, facingsOf, framesOf, STATE_LABELS, labelFor } from '@rotp/game-data';
import { poseLabelsOf } from '../../behavior/pose-labels';
import { GROUP_ORDER, ROW_SHAPE } from './StateList.constants';
import type { StateListProps } from './StateList.type';
import './StateList.css';

const StateList = (props: StateListProps) => {
  const { selected, onSelect, fill = false, labels } = props;
  const [filter, setFilter] = useState('');
  const text = useMemo(() => poseLabelsOf(labels), [labels]);

  const grouped = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const rows = POSE_ATLAS.states
      .map((state) => ({ state, meta: labelFor(state.action), name: text.stateName(state.action) }))
      .filter(({ name }) => !needle || name.toLowerCase().includes(needle));
    return GROUP_ORDER
      .map((group) => ({ group, items: rows.filter(({ meta }) => meta.group === group) }))
      .filter(({ items }) => items.length > 0);
  }, [filter, text]);

  return (
    <Box className={fill ? 'state-list state-list--fill' : 'state-list'}>
      <SearchInput
        value={filter}
        onChange={setFilter}
        placeholder={text.filterStates(STATE_LABELS.length)}
      />
      <Box className="state-list__scroll">
        {grouped.map(({ group, items }) => (
          <ListItemList key={group} heading={text.groupName(group)} count={items.length} shape={ROW_SHAPE}>
            {items.map(({ state, name }) => {
              const total = facingsOf(state).reduce<number>((n, f) => n + framesOf(state, f).length, 0);
              return (
                <ListItemRow
                  key={state.action}
                  name={name}
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
