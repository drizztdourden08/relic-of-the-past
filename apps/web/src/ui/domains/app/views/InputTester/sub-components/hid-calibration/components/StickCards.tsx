/* @layer renderer-components @kind component */
import { Box } from '../../../../../../../design-system/primitives/Box';
import { StickCard } from './StickCard';
import { STICK_SIDES } from './StickCards.constants';
import type { StickCardsProps } from './StickCards.type';

const StickCards = (props: StickCardsProps) => (
  <Box className="hid-cal__prereqs">
    {STICK_SIDES.map(side => <StickCard key={side} side={side} {...props} />)}
  </Box>
);

export { StickCards };
