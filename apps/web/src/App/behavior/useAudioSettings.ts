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

  /**
   * Takes the volume as loaded. A `--muted` launch is already zero here, because the
   * flag is applied once in mergeSettings where the setting is born — not layered on
   * afterwards. Two earlier attempts set the engine volume (and then the muteOverride)
   * from here instead, and both lost: pushLiveSettings re-applies settings.masterVolume
   * to the gain node AND the WASM mixer when the game starts, so anything not in the
   * setting itself is overwritten while the control keeps showing the value it set.
   */
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
