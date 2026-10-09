/* @layer shared-game @kind logic */
import { POND_PRICE_LADDER } from '../pond-ladder.constants';

const rungOf = (price: number): number => {
  const rung = POND_PRICE_LADDER.indexOf(price);
  if (rung !== -1) return rung;
  const above = POND_PRICE_LADDER.findIndex((value) => value >= price);
  return above === -1 ? POND_PRICE_LADDER.length - 1 : above;
};

export { rungOf };
