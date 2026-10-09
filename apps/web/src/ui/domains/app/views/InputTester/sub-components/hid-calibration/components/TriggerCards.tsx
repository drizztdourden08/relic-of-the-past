/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { TRIGGER_IDS } from '../hid-calibration.constants';
import { STICK_SIDES } from './StickCards.constants';
import { TriggerCard } from './TriggerCard';
import type { TriggerCardsProps } from './TriggerCards.type';

const TriggerCards = (props: TriggerCardsProps) => {
  if (!props.items.some(it => TRIGGER_IDS.has(it.id))) return null;

  return (
    <Box className="hid-cal__prereqs">
      {STICK_SIDES.map(side => <TriggerCard key={side} side={side} {...props} />)}
    </Box>
  );
};

export { TriggerCards };
