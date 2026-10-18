/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import { useSettings } from '@drizztdourden08/brock-react';
import { experimentalFeaturesEnabled } from '@rotp/features';
import type { AppSettings } from '@app/settings.type';
import { subscribeGameState } from '@app/game';
import {
  clearPendingBoot, getPendingBoot, getSessionState, onlineConfigOfProfile,
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

const allowedPendingBoot = (profileId: string | null, experimental: boolean): PendingBoot | null => {
  const pending = getPendingBoot();
  if (!pending || (profileId !== null && pending.profileId !== profileId)) return null;
  if (pending.config.mode === 'online' && !experimental) {
    clearPendingBoot();
    return null;
  }
  return pending;
};

const useRandomizerBoot = (activeProfileId: string | null) => {
  const { settings } = useSettings<AppSettings>();
  const experimental = experimentalFeaturesEnabled(settings);
  const experimentalRef = useRef(experimental);
  experimentalRef.current = experimental;
  const startedForBoot = useRef(false);
  const wasRunning = useRef(false);
  const profileIdRef = useRef(activeProfileId);
  profileIdRef.current = activeProfileId;

  useEffect(() => {
    if (experimental) return;
    if (getPendingBoot()?.config.mode === 'online') clearPendingBoot();
    if (getSessionState().session?.kind === 'online') stopActive();
  }, [experimental]);

  useEffect(() => subscribeGameState((state) => {
    const running = state.status === 'running';
    if (running && !wasRunning.current) {
      wasRunning.current = true;
      const pending = allowedPendingBoot(profileIdRef.current, experimentalRef.current);
      if (!pending || startedForBoot.current) return;
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
