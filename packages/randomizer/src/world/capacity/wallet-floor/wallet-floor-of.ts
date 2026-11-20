/* @layer shared-game @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { optionText } from '../../options/option-text';
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
  return { need, label, rung, top: itemAt(WALLET.ladder, rung), reason: optionText(msg('randomizer-world:wallet.reason', { label, need })) };
};

export { walletFloorOf };
