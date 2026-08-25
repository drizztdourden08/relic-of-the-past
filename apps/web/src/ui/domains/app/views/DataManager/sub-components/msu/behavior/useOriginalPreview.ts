/* @layer renderer-components @kind hook */
/**
 * Auditions the sound chip's own version of a sound or a music track, alongside the pack preview
 * rather than instead of it.
 *
 * Kept separate from `useSoundPreview` on purpose: that one builds a pack session with layers,
 * schedules and meters, and an original has none of those — it is a single buffer straight from the
 * chip. Sharing one hook would mean one of the two carrying machinery it has no use for.
 *
 * The button is never disabled on an availability check. Whether the core can render is not
 * something this view is told about — it changes when the game boots, with no re-render here to
 * notice — so a cached "no" would grey the button out for the rest of the session. Pressing it
 * always tries, and says why if it cannot.
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
