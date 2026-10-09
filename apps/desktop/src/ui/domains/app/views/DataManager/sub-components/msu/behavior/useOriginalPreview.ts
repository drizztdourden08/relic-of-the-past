/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { playOriginalSound, stopOriginalSound } from '@app/lib/game/original-sound';
import type { PreviewTarget } from '@app/lib/game/original-sound';
import { NO_ASSETS } from './useOriginalPreview.constants';

const useOriginalPreview = (target: PreviewTarget) => {
  const [playing, setPlaying] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const stop = useCallback(() => {
    setPlaying(null);
    stopOriginalSound();
  }, []);

  const play = useCallback((soundId: number) => {
    if (playing === soundId) {
      stop();
      return;
    }
    setNote(null);
    setPlaying(soundId);
    void playOriginalSound(target, soundId, () => {
      setPlaying((current) => (current === soundId ? null : current));
    }).then((outcome) => {
      if (outcome.started) return;
      setPlaying((current) => (current === soundId ? null : current));
      setNote(outcome.silent ? 'The sound chip plays nothing for that one' : NO_ASSETS);
    });
  }, [target, playing, stop]);

  useEffect(() => stop, [target, stop]);

  return { playing, note, play, stop };
};

export { useOriginalPreview };
