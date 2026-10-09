/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import { subscribeGameState } from '@app/game';
import {
  clearPendingBoot, getPendingBoot, onlineConfigOfProfile,
  startLocalFromPlacement, startOnline, stopActive,
} from '@app/game/randomizer-client';
import { log } from '@app/log-bus';
import type { PendingBoot } from '@app/game/randomizer-client';

const startPendingSession = (pending: PendingBoot): void => {
  const { config, placement } = pending;
  if (config.mode === 'local' && placement) {
    log.randomizer(`[Boot] Auto-starting local session for this profile (seed ${config.seed})`);
    void startLocalFromPlacement(placement, 'profile');
  } else if (config.mode === 'online') {
    const online = onlineConfigOfProfile(config);
    log.randomizer(`[Boot] Auto-starting online session for this profile (slot ${online.slotName})`);
    void startOnline(online, 'profile');
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
