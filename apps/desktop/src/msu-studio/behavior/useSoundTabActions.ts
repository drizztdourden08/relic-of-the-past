/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { SoundChannel } from '@rotp/game-data';
import { soundTitle } from '../sound-labels';
import type { SoundTabActionsParams } from './sound-tab-actions.type';

const useSoundTabActions = (params: SoundTabActionsParams) => {
  const { sound, onDeleteConfirm } = params;
  const { stopReplacing, toggleLayers, playOriginal } = sound;

  const confirmStopReplacing = useCallback((channel: SoundChannel, soundId: number) => {
    onDeleteConfirm(
      'Stop Replacing Sound',
      `Remove this pack's layers for ${soundTitle(channel, soundId)}? It will play from the sound chip again.`,
      () => { void stopReplacing(soundId); },
    );
  }, [onDeleteConfirm, stopReplacing]);

  const select = useCallback((_channel: SoundChannel, soundId: number) => toggleLayers(soundId), [toggleLayers]);
  const original = useCallback((_channel: SoundChannel, soundId: number) => playOriginal(soundId), [playOriginal]);

  return { confirmStopReplacing, select, original };
};

export { useSoundTabActions };
