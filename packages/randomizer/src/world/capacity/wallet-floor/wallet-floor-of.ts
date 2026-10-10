/* @layer shared-game @kind logic */
import { itemAt } from '../../../checked-access';
import { WALLET } from '../capacity-family';
import { walletDemandsOf } from './wallet-demands-of';
import type { PartialOptionValues } from '../../options.type';
import type { WalletDemand, WalletFloor } from './wallet-floor.type';

const dearestOf = (demands: readonly WalletDemand[]): WalletDemand =>
  demands.reduce((dearest, demand) => (demand.need > dearest.need ? demand : dearest));

const rungHolding = (need: number): number => {
  const rung = WALLET.ladder.findIndex((value) => value >= need);
  return rung === -1 ? WALLET.ladder.length - 1 : rung;
};

const walletFloorOf = (values: PartialOptionValues): WalletFloor => {
  const { need, label } = dearestOf(walletDemandsOf(values));
  const rung = rungHolding(need);
  return { need, label, rung, top: itemAt(WALLET.ladder, rung), reason: `${label} can ask for ${need} at once` };
};

export { walletFloorOf };
