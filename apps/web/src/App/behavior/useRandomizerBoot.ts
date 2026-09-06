/* @layer renderer-appshell @kind hook */
/**
 * Auto-start for profile-tied randomizer sessions. A gated boot parks the
 * session material in the session store's pending slot; when the game reaches
 * 'running' with a pending entry for the current profile, the matching session
 * starts with no user action. When the game leaves 'running' the active
 * session stops with it — a randomized session never outlives its game.
 * Restart-safe: every gated boot re-parks a pending entry, and the started
 * flag re-arms as soon as the game stops.
 */
import { useEffect, useRef } from 'react';
import {
  capacityBonusFromSnapshot, capacityProfileFromSnapshot, capacityProgressiveFromSnapshot,
} from '@shared/randomizer/ap-world/capacity';
import { normalizeRandomizerOptions } from '@shared/randomizer/options-snapshot';
import { subscribeGameState } from '../../lib/game';
import {
  clearPendingBoot, getPendingBoot, normalizeServerUrl,
  startLocalFromPlacement, startOnline, stopActive,
} from '../../lib/game/randomizer-client';
import { log } from '../../lib/log-bus';
import type { PendingBoot } from '../../lib/game/randomizer-client';

const DEFAULT_SLOT_NAME = 'Player';

const startPendingSession = (pending: PendingBoot): void => {
  const { config, placement } = pending;
  if (config.mode === 'local' && placement) {
    log.randomizer(`[Boot] Auto-starting local session for this profile (seed ${config.seed})`);
    void startLocalFromPlacement(placement, 'profile');
  } else if (config.mode === 'online') {
    const slotName = config.slotName ?? DEFAULT_SLOT_NAME;
    log.randomizer(`[Boot] Auto-starting online session for this profile (slot ${slotName})`);
    // No placement online: the profile's frozen options carry its capacity settings.
    const snapshot = normalizeRandomizerOptions(config.options);
    const capacity = capacityProfileFromSnapshot(snapshot);
    const capacityProgressive = capacityProgressiveFromSnapshot(snapshot);
    const capacityBonus = capacityBonusFromSnapshot(snapshot);
    void startOnline({
      url: normalizeServerUrl(config.serverUrl ?? ''), slotName, capacity, capacityProgressive, capacityBonus,
    }, 'profile');
  }
};

const useRandomizerBoot = (activeProfileId: string | null) => {
  const startedForBoot = useRef(false);
  const wasRunning = useRef(false);
  const profileIdRef = useRef(activeProfileId);
  profileIdRef.current = activeProfileId;

  useEffect(() => subscribeGameState((state) => {
    const running = state.status === 'running';
    if (running && !wasRunning.current) {
      wasRunning.current = true;
      const pending = getPendingBoot();
      if (!pending || startedForBoot.current) return;
      if (profileIdRef.current != null && pending.profileId !== profileIdRef.current) return;
      startedForBoot.current = true;
      clearPendingBoot();
      startPendingSession(pending);
    } else if (!running && wasRunning.current) {
      wasRunning.current = false;
      startedForBoot.current = false;
      stopActive();
    }
  }), []);
};

export { useRandomizerBoot };
