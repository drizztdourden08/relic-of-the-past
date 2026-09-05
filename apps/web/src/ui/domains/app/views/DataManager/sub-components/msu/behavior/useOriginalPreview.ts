/* @layer renderer-components @kind hook */
/**
 * Auditions the sound chip's own version of a sound or track. Separate from `useSoundPreview`,
 * which builds a whole pack session; an original is one buffer. The button is never disabled on
 * an availability check: whether the core can render changes when the game boots, with no
 * re-render here to notice, so pressing always tries and says why if it cannot.
 */
import { useCallback, useEffect, useState } from 'react';
import { playOriginalSound, stopOriginalSound } from '@app/lib/game/original-sound';
import type { PreviewTarget } from '@app/lib/game/original-sound';

/** Shown when there is no ROM with extracted assets to read the original sounds out of. */
const NO_ASSETS = 'No extracted game assets to read the original sounds from';

const useOriginalPreview = (target: PreviewTarget) => {
  // Which id's original is sounding, so a row can light its own button. Null when nothing is.
  const [playing, setPlaying] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const stop = useCallback(() => {
    setPlaying(null);
    stopOriginalSound();
  }, []);

  const play = useCallback((soundId: number) => {
    // A second press on the one already sounding is a stop, the way the pack preview behaves.
    if (playing === soundId) {
      stop();
      return;
    }
    setNote(null);
    // Light the button straight away: the first press may wait on a core load, and a control that
    // does nothing for a second reads as broken.
    setPlaying(soundId);
    void playOriginalSound(target, soundId, () => {
      setPlaying((current) => (current === soundId ? null : current));
    }).then((outcome) => {
      if (outcome.started) return;
      // Only clear the row this call was for; another press may already have superseded it.
      setPlaying((current) => (current === soundId ? null : current));
      setNote(outcome.silent ? 'The sound chip plays nothing for that one' : NO_ASSETS);
    });
  }, [target, playing, stop]);

  // Switching channel or leaving the view must silence it.
  useEffect(() => stop, [target, stop]);

  return { playing, note, play, stop };
};

export { useOriginalPreview };
