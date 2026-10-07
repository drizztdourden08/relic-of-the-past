/* @layer shared-game @kind data */
/**
 * The clarifier each pond row carries. The mode row needs one per pond,
 * because "vanilla cost" means a different economy at each: the capacity pond
 * charges a hundred a throw for its upgrades, and a wish pond charges nothing
 * at all for its two grants. The item count and the free sequence read the
 * same everywhere, so those two lines are shared. The switch over all three
 * ponds has one line of its own.
 */
import { POND_INSTANCES } from './pond-instances.data';
import { pondKeyOf } from './pond-option-keys';
import { POND_SHARE_KEY } from './pond-share';
import type { OptionDescription } from '../option-description.type';
import type { PondInstance } from './pond-instance.type';

const JUMPS = 'Comma separated steps adding up to the whole climb; read only with the Free sequence curve.';

const ITEMS = 'Zero leaves this pond out of the shuffle.';

const CUSTOM_LINE = { term: 'Custom', detail: 'your own price ladder; the first few throws hand over a shuffled item.' };

/** The capacity pond sells upgrades, so its native economy has a price to keep. */
const CAPACITY_MODE: OptionDescription = [
  { term: 'Vanilla cost', detail: 'the same throws and prices, but the first few hand over a shuffled item.' },
  CUSTOM_LINE,
];

/** A wish pond hands its two grants over for nothing, so its native economy is free. */
const WISH_MODE: OptionDescription = [
  { term: 'Vanilla cost', detail: 'the two grants shuffled, handed over for nothing, as the game gives them.' },
  CUSTOM_LINE,
];

const descriptionsOf = (pond: PondInstance): [string, OptionDescription][] => [
  [pondKeyOf(pond, 'mode'), pond.id === 'capacity' ? CAPACITY_MODE : WISH_MODE],
  [pondKeyOf(pond, 'items'), ITEMS],
  [pondKeyOf(pond, 'jumps'), JUMPS],
];

const SHARE = 'All three ponds read the capacity pond rows; their own are kept and come back when you turn this off.';

const POND_OPTION_DESCRIPTIONS: Readonly<Record<string, OptionDescription>> = Object.fromEntries([
  [POND_SHARE_KEY, SHARE],
  ...POND_INSTANCES.flatMap(descriptionsOf),
]);

export { POND_OPTION_DESCRIPTIONS };
