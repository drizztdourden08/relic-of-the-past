/* @layer bridge-wasm @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';
import { readJson } from '@drizztdourden08/brock-core';
import type { SlotRecord } from '@rotp/game-core';
import { gearOwnershipState } from '@rotp/game-core';
import { gearOwnershipPath } from '@rotp/game-core';
import { applyTiers } from './apply-tiers';

const initGearOwnership = (id: string | null): void => {
  const state = gearOwnershipState;
  if (id === state.loadedFor) return;
  state.loadedFor = id;
  state.record = {};
  state.loaded = false;
  state.pending = null;
  if (!id) return;
  void readJson<SlotRecord>(getPlatform().files, gearOwnershipPath(id), {}).then((stored) => {
    if (state.loadedFor !== id) return;
    state.record = stored;
    state.loaded = true;
    const held = state.pending;
    state.pending = null;
    if (held) applyTiers(id, held);
  });
};

export { initGearOwnership };
