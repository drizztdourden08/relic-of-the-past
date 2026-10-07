/* @layer renderer-appshell @kind hook */
import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { setMasterVolume, subscribeGameState } from '../../lib/game';

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
   * A launch flag is applied by USING the mute control, not by working around it.
   *
   * The settings push that runs when the game starts re-applies the profile's
   * volume, so anything set before that is undone. So this waits for the game to
   * be running, then presses the mute button once. Nothing new gates the audio.
   *
   * Both flags are honoured, so the result never depends on the volume the profile
   * happens to hold: --muted presses it only if sound is on, --sound only if it is off.
   */
  useEffect(() => {
    const startup = window.api?.startup;
    if (!startup?.muted && !startup?.sound) return;
    let fired = false;
    const unsub = subscribeGameState((state) => {
      if (fired || state.status !== 'running') return;
      fired = true;
      const wantMute = startup.muted === true;
      // Read through the setter to avoid depending on a stale render's value.
      setMasterVolumeState((current) => {
        if (wantMute === (current === 0)) return current; // already as asked
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

  /**
   * Takes the volume as loaded. A `--muted` launch is already zero here, because the
   * flag is applied once in mergeSettings where the setting is born. Two earlier
   * attempts set the engine volume (and the muteOverride) from here instead, and
   * both lost: pushLiveSettings re-applies settings.masterVolume to the gain node
   * AND the WASM mixer when the game starts.
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
