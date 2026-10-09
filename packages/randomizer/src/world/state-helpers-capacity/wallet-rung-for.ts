/* @layer shared-game @kind logic */
import { WALLET } from '../capacity/capacity-family';

const walletRungFor = (price: number): number => {
  const rung = WALLET.ladder.findIndex((value) => value >= price);
  if (rung === -1) throw new Error(`no wallet rung holds ${price}`);
  return rung;
};

export { walletRungFor };
