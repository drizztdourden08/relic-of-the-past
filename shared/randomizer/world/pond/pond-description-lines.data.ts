/* @layer shared-game @kind data */
import type { OptionDescription } from '../option-description.type';

const POND_JUMPS_DESCRIPTION = 'Comma separated steps adding up to the whole climb; read only with the Free sequence curve.';

const POND_ITEMS_DESCRIPTION = 'Zero leaves this pond out of the shuffle.';

const POND_CUSTOM_LINE = { term: 'Custom', detail: 'your own price ladder; the first few throws hand over a shuffled item.' };

const CAPACITY_POND_MODE_DESCRIPTION: OptionDescription = [
  { term: 'Vanilla cost', detail: 'the same throws and prices, but the first few hand over a shuffled item.' },
  POND_CUSTOM_LINE,
];

const WISH_POND_MODE_DESCRIPTION: OptionDescription = [
  { term: 'Vanilla cost', detail: 'the two grants shuffled, handed over for nothing, as the game gives them.' },
  POND_CUSTOM_LINE,
];

const POND_SHARE_DESCRIPTION = 'All three ponds read the capacity pond rows; their own are kept and come back when you turn this off.';

export {
  CAPACITY_POND_MODE_DESCRIPTION, POND_ITEMS_DESCRIPTION, POND_JUMPS_DESCRIPTION, POND_SHARE_DESCRIPTION,
  WISH_POND_MODE_DESCRIPTION,
};
