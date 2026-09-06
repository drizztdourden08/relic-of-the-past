/* @layer shared-game @kind logic */
/**
 * The pond held to what the wallet can hold. A throw the wallet can never pay
 * for leaves the prize behind it out of logic, and under full accessibility
 * an unreachable prize means no seed rolls at all. So every reading of a pond
 * setting passes through here with the wallet family's reachable top: Custom
 * has its price range pulled down to the highest ladder rung the wallet
 * reaches, and the two fixed schedules (vanilla cost at a hundred a throw,
 * gamble climbing to 240) carry the wallet's top as a ceiling the plan holds
 * every price at. A vanilla wallet holds 999, above everything the pond can
 * ask, so a profile that never touched the wallet reads exactly as before.
 *
 * The wallet's top is the same number every other ceiling reads
 * (capacity/reachable-top.ts), so a rupee price, a shot cost and a throw can
 * never disagree about what a wallet holds.
 */
import { WALLET } from '../capacity/capacity-family';
import { reachableTopOf } from '../capacity/reachable-top';
import { isValidFreeSequence } from '../capacity/curves/free-sequence';
import { POND_PRICE_LADDER } from './pond-ladder.data';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondCustomSetting, PondSetting } from './pond-profile.type';

interface HeldPondSetting {
  setting: PondSetting;
  /** One line per clamp applied; [] when the wallet reaches every price. */
  notes: readonly string[];
}

/** The highest rupee count this profile's wallet can ever hold. */
const pondWalletTopOf = (profile: CapacityProfile): number => reachableTopOf(WALLET, profile);

/** The highest price rung the wallet reaches; rung 0 (free) at the very least. */
const pondCeilingRungOf = (walletTop: number): number => {
  let rung = 0;
  POND_PRICE_LADDER.forEach((price, index) => { if (price <= walletTop) rung = index; });
  return rung;
};

const priceLabel = (price: number): string => (price === 0 ? 'free' : String(price));

const holdCustom = (setting: PondCustomSetting, walletTop: number): HeldPondSetting => {
  const ceiling = POND_PRICE_LADDER[pondCeilingRungOf(walletTop)];
  if (setting.max <= ceiling) return { setting, notes: [] };
  const notes = [`pond: the wallet tops out at ${walletTop}, so the price range is held at ${priceLabel(ceiling)}`];
  const start = Math.min(setting.start, ceiling);
  const span = POND_PRICE_LADDER.indexOf(ceiling) - POND_PRICE_LADDER.indexOf(start);
  const keepsFree = setting.shape.curve === 'free' && isValidFreeSequence(setting.shape.jumps, span);
  if (setting.shape.curve === 'free' && !keepsFree) {
    notes.push(`pond: the free sequence no longer sums to the span ${span}, using equal`);
  }
  const shape = keepsFree ? setting.shape : { curve: 'equal' as const };
  return { setting: { ...setting, start, max: ceiling, shape }, notes };
};

/**
 * The setting as the seed reads it under this wallet: the legacy pond
 * untouched, Custom's range pulled down onto the ladder, a fixed schedule
 * handed back as it stands.
 *
 * The two fixed schedules need no holding. Their dearest throw is 240, and
 * the wallet floor (capacity/wallet-floor.ts) keeps every reachable top at
 * 599 or above, because a fixed 500-rupee purchase sits in front of the
 * ending. Only a Custom range, which climbs to 999, can still outrun a
 * wallet.
 */
const holdPondToWallet = (setting: PondSetting, walletTop: number): HeldPondSetting => {
  if (setting.mode === 'capacity') return { setting, notes: [] };
  if (setting.mode === 'custom') return holdCustom(setting, walletTop);
  return { setting, notes: [] };
};

export { holdPondToWallet, pondCeilingRungOf, pondWalletTopOf };
export type { HeldPondSetting };
