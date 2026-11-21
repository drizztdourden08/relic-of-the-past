/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import type { SoundChannel } from '@rotp/game-data';
import { soundTitle } from '../sound-labels';
import type { SoundTabActionsParams } from './sound-tab-actions.type';

const useSoundTabActions = (params: SoundTabActionsParams) => {
  const { sound, onDeleteConfirm } = params;
  const { stopReplacing, toggleLayers, playOriginal } = sound;
  const t = useT();

  const confirmStopReplacing = useCallback((channel: SoundChannel, soundId: number) => {
    onDeleteConfirm(
      t('msu-studio:sound.stop-replacing.title'),
      t('msu-studio:sound.stop-replacing.message', { sound: soundTitle(channel, soundId) }),
      () => { void stopReplacing(soundId); },
    );
  }, [t, onDeleteConfirm, stopReplacing]);

  const select = useCallback((_channel: SoundChannel, soundId: number) => toggleLayers(soundId), [toggleLayers]);
  const original = useCallback((_channel: SoundChannel, soundId: number) => playOriginal(soundId), [playOriginal]);

  return { confirmStopReplacing, select, original };
};

export { useSoundTabActions };
