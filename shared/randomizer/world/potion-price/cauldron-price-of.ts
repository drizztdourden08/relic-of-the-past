/* @layer shared-game @kind logic */
import { POTION_CAULDRONS } from './potion-cauldrons.constants';

const cauldronPriceOf = (content: string): number | undefined =>
  POTION_CAULDRONS.find((row) => row.content === content)?.price;

export { cauldronPriceOf };
