/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import type { ActiveState } from '@rotp/game-core';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import './ActiveStates.css';

const ActiveStates = ({ states }: { states: readonly ActiveState[] }) => {
  const t = useT();
  return (
    <Box className="nav-section">
      <Box className="nav-section-title">{t('views-navigation:states.title')}</Box>
      {states.length === 0 ? (
        <Text className="nav-active-states__none">{t('views-navigation:states.none')}</Text>
      ) : (
        <Box className="nav-active-states__row">
          {states.map((state) => (
            <Text key={state.id} className={state.gating ? 'nav-active-states__chip nav-active-states__chip--gating' : 'nav-active-states__chip'} title={state.hint ?? state.detail ?? state.label}>
              {state.label}
              {state.detail && <Text className="nav-active-states__detail"> · {state.detail}</Text>}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

export { ActiveStates };
