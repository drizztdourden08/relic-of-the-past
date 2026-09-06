/* @layer shared-game @kind logic */
/**
 * The lowest rung a family's FINAL capacity may stop at, and the sentence
 * saying why. ONE reader for both floors, so the editor's thumb and the
 * snapshot reader's fallback can never disagree about where a family stops.
 *
 * The projectiles ladder opens on the empty rung, and a Custom setting may end
 * there too (start 0, max 0): a file that never holds an arrow. The seed's
 * ending takes the final fight's silver shots back to back (final-fight.data.ts),
 * so an arrow capacity that cannot hold that many can never finish, and under full
 * accessibility the generator would refuse every seed. The floor is the first
 * rung that holds the count, which on the native grid is the first native
 * level.
 *
 * The wallet's floor is not a constant: it is whatever the settings let the
 * seed charge at once, derived next door (wallet-floor.ts) and handed in. A
 * caller with no settings to read passes nothing and gets no floor.
 *
 * Every other family may end anywhere on its ladder.
 */
import { FINAL_FIGHT_SILVER_HITS } from '../final-fight.data';
import { NO_WALLET_FLOOR } from './wallet-floor';
import type { CapacityFamily } from './capacity-family';
import type { WalletFloor } from './wallet-floor';

const maxRungFloorOf = (family: CapacityFamily, walletFloor: WalletFloor = NO_WALLET_FLOOR): number => {
  if (family.id === 'wallet') return walletFloor.rung;
  if (family.id !== 'projectiles') return 0;
  const rung = family.ladder.findIndex((value) => value >= FINAL_FIGHT_SILVER_HITS);
  return rung === -1 ? family.ladder.length - 1 : rung;
};

/** The max rung as the family allows it: raised onto the floor when it sits below. */
const heldMaxRungOf = (family: CapacityFamily, maxRung: number, walletFloor: WalletFloor = NO_WALLET_FLOOR): number =>
  Math.max(maxRung, maxRungFloorOf(family, walletFloor));

/**
 * What put the floor there, as one clause a row can print; undefined for a
 * family whose floor is the bottom of its own ladder.
 */
const maxFloorReasonOf = (
  family: CapacityFamily, walletFloor: WalletFloor = NO_WALLET_FLOOR,
): string | undefined => {
  if (family.id === 'wallet') return walletFloor.rung > 0 ? walletFloor.reason : undefined;
  if (family.id !== 'projectiles') return undefined;
  return `the ending takes ${FINAL_FIGHT_SILVER_HITS} silver shots back to back`;
};

export { heldMaxRungOf, maxFloorReasonOf, maxRungFloorOf };
