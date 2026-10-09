/* @layer shared-game @kind logic */
import { POND_PRICE_LADDER } from '../pond-ladder.data';

const pondCeilingRungOf = (walletTop: number): number => {
  let rung = 0;
  POND_PRICE_LADDER.forEach((price, index) => { if (price <= walletTop) rung = index; });
  return rung;
};

export { pondCeilingRungOf };
