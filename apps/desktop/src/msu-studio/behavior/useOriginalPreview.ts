/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { playOriginalSound, stopOriginalSound } from '@app/game/original-sound';
import type { PreviewTarget } from '@app/game/original-sound';

const useOriginalPreview = (target: PreviewTarget) => {
  const t = useT();
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
      setNote(outcome.silent ? t('msu-studio:sound.original.silent') : t('msu-studio:sound.original.no-assets'));
    });
  }, [t, target, playing, stop]);

  useEffect(() => stop, [target, stop]);

  return { playing, note, play, stop };
};

export { useOriginalPreview };
