/* @layer shared-input @kind logic */
import { GAMEPLAY_VERBS } from './core-positions.constants';
import { positionOfBinding } from './position-of-binding';
import type { CoreBindings } from '@rotp/game-data';
import type { SdlPosition } from './core-positions.type';

const corePositions = (core: CoreBindings): Set<SdlPosition> => {
  const claimed = new Set<SdlPosition>();
  for (const verb of GAMEPLAY_VERBS) {
    const position = positionOfBinding(core[verb]);
    if (position) claimed.add(position);
  }
  return claimed;
};

export { corePositions };
