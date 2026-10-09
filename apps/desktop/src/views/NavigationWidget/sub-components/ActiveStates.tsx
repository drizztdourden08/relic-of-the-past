/* @layer renderer-widgets @kind component */
import type { ActiveState } from '@rotp/game-core';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { S } from '../styles';
import { IL } from './ActiveStates.constants';

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
