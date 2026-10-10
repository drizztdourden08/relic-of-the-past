/* @layer renderer-components @kind logic */
import { POND_INSTANCES } from '@rotp/randomizer';
import type { PondInstance } from '@rotp/randomizer';

const firstPond = (): PondInstance => {
  const [first] = POND_INSTANCES;
  if (!first) throw new Error('the randomizer defines no wishing pond');
  return first;
};

export { firstPond };
