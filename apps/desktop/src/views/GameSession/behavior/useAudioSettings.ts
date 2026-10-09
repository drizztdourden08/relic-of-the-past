/* @layer renderer-appshell @kind hook */
import { appApi } from '@app/ipc/app-api';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameSettings } from '@rotp/features';
import { setMasterVolume, subscribeGameState } from '@app/lib/game';

const useAudioSettings = () => {
  const [masterVolume, setMasterVolumeState] = useState(100);
  const prevVolumeRef = useRef(100);
  const [muteOverride, setMuteOverride] = useState<{ volume: number; version: number } | null>(null);
  const muteVersionRef = useRef(0);

  const handleMasterVolumeChange = useCallback((volume: number) => {
    setMasterVolumeState(volume);
    if (volume > 0) prevVolumeRef.current = volume;
  }, []);

  const handleToggleMute = useCallback(() => {
    const v = ++muteVersionRef.current;
    if (masterVolume > 0) {
      prevVolumeRef.current = masterVolume;
      setMasterVolumeState(0);
      setMuteOverride({ volume: 0, version: v });
      setMasterVolume(0);
    } else {
      const restored = prevVolumeRef.current || 100;
      setMasterVolumeState(restored);
      setMuteOverride({ volume: restored, version: v });
      setMasterVolume(restored);
    }
  }, [masterVolume]);

  useEffect(() => {
    const startup = appApi()?.startup;
    if (!startup?.muted && !startup?.sound) return;
    let fired = false;
    const unsub = subscribeGameState((state) => {
      if (fired || state.status !== 'running') return;
      fired = true;
      const wantMute = startup.muted === true;
      setMasterVolumeState((current) => {
        const alreadyAsAsked = wantMute === (current === 0);
        if (alreadyAsAsked) return current;
        const v = ++muteVersionRef.current;
        const next = wantMute ? 0 : (prevVolumeRef.current || 100);
        if (!wantMute) prevVolumeRef.current = next;
        setMuteOverride({ volume: next, version: v });
        setMasterVolume(next);
        return next;
      });
      unsub();
    });
    return unsub;
  }, []);

  const initFromSettings = useCallback((volume: number) => {
    setMasterVolumeState(volume);
    if (volume > 0) prevVolumeRef.current = volume;
  }, []);

  return {
    masterVolume,
    muteOverride,
    isMuted: masterVolume === 0,
    handleMasterVolumeChange,
    handleToggleMute,
    initFromSettings,
  };
};

export { useAudioSettings };
