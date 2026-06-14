/* @layer renderer-appshell @kind hook */
import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { setMasterVolume } from '../../lib/game';

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
