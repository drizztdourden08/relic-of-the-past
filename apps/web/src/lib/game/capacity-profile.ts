/* @layer bridge-wasm @kind logic */
/**
 * Capacity profile: JS-side arming for the in-core capacity profile
 * (core/game-hooks/capacity_profile.c: starting rungs for a new file, where rung 0 is
 * the empty tier below the native grid, the rung a family may reach, the wallet
 * ladder cap) and the wallet jump table
 * (wallet_grants.c: slot -> ladder rungs). Same contract as the override bridges:
 * every write only records, the gate bit is requested alongside it, and it stays
 * open only while a profile is armed. The session layer composes these from the
 * profile's family plans; this file is the ccall surface only.
 */

import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { setCapacityProfileActive } from './live-settings-flags';
import { reassertGateWord3 } from './live-settings';
import {
  CAPACITY_FAMILY_INDEX, CAPACITY_FAMILY_LAST_TIER, WALLET_JUMP_SLOTS, WALLET_LADDER_LAST,
} from './capacity-profile.constants';
import type { CapacityFamilyId } from '@shared/game/data';

type CapacityFamilyArm = {
  family: CapacityFamilyId;
  /** false = the family stays on its native grid (vanilla or vanilla-in-pool). */
  custom: boolean;
  /** Ladder rungs (0 = the empty tier; the wallet's is its index 0-100); ignored unless custom. */
  startTier: number;
  maxTier: number;
};

const tierInRange = (family: CapacityFamilyId, tier: number): boolean =>
  Number.isInteger(tier) && tier >= 0 && tier <= CAPACITY_FAMILY_LAST_TIER[family];

// Request the gate. Alone it changes nothing in the core: every profile seam keeps its
// native answer until a family is armed below, so a session whose families all stay on
// the native grid can still raise it for the hold-up icons (upgrade-icons.ts).
const openCapacityGate = (): void => {
  setCapacityProfileActive(true);
  reassertGateWord3();
};

// Arm one family. The gate is requested with the record-only write so it has latched
// into WRAM (SyncGateWords, next frame) long before a new file or a grant reads it.
const setCapacityProfileFamily = (arm: CapacityFamilyArm): void => {
  const { family, custom, startTier, maxTier } = arm;
  if (custom && (!tierInRange(family, startTier) || !tierInRange(family, maxTier) || maxTier < startTier)) {
    log.error(`[Randomizer] Capacity profile refused: ${family} tiers ${startTier}..${maxTier} `
      + `are off the grid (last tier ${CAPACITY_FAMILY_LAST_TIER[family]})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setCapacityProfileFamily called with no active module');
    return;
  }
  openCapacityGate();
  mod.ccall('WasmSetCapacityProfile', null, ['number', 'number', 'number', 'number'],
    [CAPACITY_FAMILY_INDEX[family], custom ? 1 : 0, custom ? startTier : 0, custom ? maxTier : 0]);
  log.randomizer(`[Randomizer] Capacity profile set: ${family} `
    + (custom ? `custom tiers ${startTier}..${maxTier}` : 'native grid'));
};

// Arm the wallet jump table: |rungsBySlot[s]| is the ladder climb a grant of virtual id
// 0x67 + s performs. Sixteen slots; a rung count past the ladder top is clamped in C.
const setWalletJumpTable = (rungsBySlot: readonly number[]): void => {
  if (rungsBySlot.length > WALLET_JUMP_SLOTS) {
    log.error(`[Randomizer] Wallet jump table refused: ${rungsBySlot.length} entries exceed `
      + `the ${WALLET_JUMP_SLOTS} slots`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setWalletJumpTable called with no active module');
    return;
  }
  mod.ccall('WasmClearWalletJumpTable', null, [], []);
  rungsBySlot.forEach((rungs, slot) => {
    mod.ccall('WasmSetWalletJumpTable', null, ['number', 'number'],
      [slot, Math.min(WALLET_LADDER_LAST, Math.max(0, Math.trunc(rungs)))]);
  });
  log.randomizer(`[Randomizer] Wallet jump table set: [${rungsBySlot.join(', ')}]`);
};

const clearCapacityProfile = (): void => {
  const mod = getModule();
  if (!mod) return;
  // Empty the profile and the table, then close the gate, the same double lock as
  // the override tables.
  mod.ccall('WasmClearCapacityProfile', null, [], []);
  mod.ccall('WasmClearWalletJumpTable', null, [], []);
  setCapacityProfileActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] Capacity profile cleared');
};

export { clearCapacityProfile, openCapacityGate, setCapacityProfileFamily, setWalletJumpTable };
export type { CapacityFamilyArm };
