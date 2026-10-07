/* @layer renderer-widgets @kind component */
/**
 * The "States" chips: everything the game currently holds true at once, like a
 * follower, story beats, or keys in hand. Renders whatever the registry reports, so
 * a new state needs no change here.
 */
import type { CSSProperties } from 'react';
import type { ActiveState } from '../../../../../lib/game/active-states';
import { Box, Text } from '../../../../design-system/primitives';
import { S } from '../styles';

const IL: Record<string, CSSProperties> = {
  row: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  chip: {
    fontSize: 10,
    padding: '1px 6px',
    borderRadius: 'var(--r-sm)',
    background: 'var(--c-hover)',
    border: '1px solid var(--c-border)',
    color: 'var(--c-text-dim)',
  },
  /** Traversal-affecting states read brighter, because they change what is reachable. */
  chipGating: {
    background: 'var(--c-green-soft)',
    border: '1px solid var(--c-green)',
    color: 'var(--c-green-bright)',
  },
  detail: { color: 'var(--c-text-muted)' },
  none: { fontSize: 10, color: 'var(--c-text-muted)', marginTop: 2 },
};

const ActiveStates = ({ states }: { states: readonly ActiveState[] }) => (
  <Box style={S.section}>
    <Box style={S.sectionTitle}>States</Box>
    {states.length === 0 ? (
      <Text style={IL.none}>none active</Text>
    ) : (
      <Box style={IL.row}>
        {states.map((state) => (
          <Text key={state.id} style={{ ...IL.chip, ...(state.gating ? IL.chipGating : {}) }} title={state.hint ?? state.detail ?? state.label}>
            {state.label}
            {state.detail && <Text style={IL.detail}> · {state.detail}</Text>}
          </Text>
        ))}
      </Box>
    )}
  </Box>
);

export { ActiveStates };
