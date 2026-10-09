/* @layer bridge-wasm @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';
import { readJson } from '@shared/storage/json';
import type { SlotRecord } from './gear-ownership.type';
import { gearOwnershipState } from './gear-ownership-state';
import { gearOwnershipPath } from './gear-ownership-path';
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
