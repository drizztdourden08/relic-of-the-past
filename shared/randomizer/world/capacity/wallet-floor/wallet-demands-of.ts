/* @layer shared-game @kind logic */
import { POTION_CAULDRONS } from '../../potion-price/potion-cauldrons.constants';
import { PRICED_ENTRIES } from '../../rules/priced-entries';
import { retroWalletNeed } from '../../retro/retro-wallet-need';
import { storedRetroBowOf } from '../../retro/retro-from-snapshot';
import { BOTTLE_KEY, bottleContentKeyOf } from '../../shops/shop-price-options.data';
import type { OptionValues, PartialOptionValues } from '../../options.type';
import type { WalletDemand } from './wallet-floor.type';

const fixedDemand = (): WalletDemand => {
  const entry = PRICED_ENTRIES.reduce((dearest, row) => (row.price > dearest.price ? row : dearest));
  return { need: entry.price, label: entry.target };
};

const bottleDemand = (values: PartialOptionValues): WalletDemand | undefined => {
  if (values[BOTTLE_KEY] !== true) return undefined;
  const offered = POTION_CAULDRONS.filter((row) => values[bottleContentKeyOf(row.content)] !== false);
  if (offered.length === 0) return undefined;
  const dearest = offered.reduce((row, next) => (next.price > row.price ? next : row));
  return { need: dearest.price, label: `${dearest.label} over the counter` };
};

const retroDemand = (values: PartialOptionValues): WalletDemand | undefined => {
  const setting = storedRetroBowOf(values as OptionValues);
  return setting.enabled ? { need: retroWalletNeed(setting), label: 'the paid shots' } : undefined;
};

const walletDemandsOf = (values: PartialOptionValues): WalletDemand[] =>
  [fixedDemand(), bottleDemand(values), retroDemand(values)]
    .filter((demand): demand is WalletDemand => demand !== undefined);

export { walletDemandsOf };
