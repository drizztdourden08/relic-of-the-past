/* @layer renderer-components @kind hook */
/**
 * Plays one file of a music pack at a time, read from the pack when its button is pressed. The
 * engine underneath already silences the last file; this holds which file is playing, which is
 * loading, and why a file did not play. Leaving the view stops the sound.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { startFileAudition, stopFileAudition } from '../../../music/behavior/file-audition';
import type { Audition } from '../../../music/behavior/file-audition';
import { previewBytes } from './preview-bytes';
import type { MusicPack } from './read-music-pack';
import type { PackSource } from '../../../pack-source.type';

/** A 30 second cut of a track can declare a repeat point past its end; that one is not shown. */
const withinPreview = (audition: Audition): Audition => (
  audition.loopSeconds !== null && audition.loopSeconds >= audition.durationSeconds
    ? { ...audition, loopSeconds: null }
    : audition
);

const usePackAudition = (source: PackSource, pack: MusicPack | null) => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [audition, setAudition] = useState<Audition | null>(null);
  const [notes, setNotes] = useState<ReadonlyMap<string, string>>(new Map());
  // Only the newest press may publish what is playing.
  const latest = useRef(0);

  const stop = useCallback(() => {
    latest.current += 1;
    stopFileAudition();
    setPlaying(null);
    setAudition(null);
  }, []);

  useEffect(() => stop, [source, stop]);

  const play = useCallback(async (fileName: string, press: number) => {
    const entry = pack?.entries.get(fileName);
    if (!entry) throw new Error('This file is not in the pack.');
    const bytes = await previewBytes(source, entry);
    if (latest.current !== press) return;
    const started = await startFileAudition(fileName, bytes, () => {
      if (latest.current === press) { setPlaying(null); setAudition(null); }
    });
    if (latest.current !== press) { started.stop(); return; }
    setPlaying(fileName);
    setAudition(withinPreview(started));
  }, [source, pack]);

  const toggle = useCallback((fileName: string) => {
    if (playing === fileName) { stop(); return; }
    stop();
    const press = latest.current;
    setLoading(fileName);
    setNotes((known) => {
      if (!known.has(fileName)) return known;
      const next = new Map(known);
      next.delete(fileName);
      return next;
    });
    play(fileName, press).catch((cause: unknown) => {
      const note = cause instanceof Error ? cause.message : 'This file could not be played.';
      setNotes((known) => new Map(known).set(fileName, note));
    }).finally(() => setLoading((name) => (name === fileName ? null : name)));
  }, [playing, stop, play]);

  return { playing, loading, audition, notes, toggle, stop };
};

export { usePackAudition };
