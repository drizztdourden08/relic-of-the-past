/* @layer renderer-components @kind hook */
/**
 * Which file in the pool is being auditioned, and the handle on it while it sounds.
 *
 * One at a time, and the engine underneath enforces that rather than this hook — so a press in a
 * filtered list still silences whatever an earlier press started, even if that row is no longer
 * rendered. What this owns is only the NAME of the file playing, which is what the list needs to
 * know to show a stop button and open a player on the right entry.
 *
 * The playhead is deliberately NOT held here. Sampling it into state would re-render the whole
 * list every frame for a readout that belongs to one expanded row, so the audition handle is
 * passed down and the player reads the clock off it itself.
 *
 * Repeat points are learned by playing. Reading one costs the whole file — the format puts it in a
 * header, but a header is only reachable by reading the bytes — and playing pays that cost anyway,
 * so the decode hands it back and it is kept per file. That is why nothing here reads a repeat
 * point on its own: doing it for a list of a hundred files would pull gigabytes through memory.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as msuStore from '@app/lib/storage/msu-store';
import { startFileAudition, stopFileAudition } from './file-audition';
import type { Audition } from './file-audition';
import type { MsuFile } from '../msu.type';

const useFileAudition = (pack: string, files: MsuFile[]) => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [audition, setAudition] = useState<Audition | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [loops, setLoops] = useState<Map<string, number | null>>(new Map());
  // A press that resolves after a newer one must not take the list over — the engine already
  // silenced its node, so only the newest press is allowed to publish what is playing.
  const latest = useRef(0);

  // Nothing should outlive the tab. Leaving the panel is a clear "stop", not a background player.
  useEffect(() => () => { stopFileAudition(); }, []);

  // `files` changing identity is the pack reporting that what is on disk has moved on. Only what
  // is no longer there is forgotten: a repeat point is dropped when its name has gone, and the
  // sounding file is silenced only if it is the one that went. Renaming one file while listening
  // to another is the ordinary case, and it must not cut the listening short or make every other
  // file re-learn its repeat point.
  const shownPack = useRef(pack);
  useEffect(() => {
    // Another pack is another pool entirely, even where two happen to share a filename.
    const present = shownPack.current === pack ? new Set(files.map((file) => file.name)) : new Set<string>();
    shownPack.current = pack;
    setLoops((known) => {
      const kept = new Map([...known].filter(([name]) => present.has(name)));
      return kept.size === known.size ? known : kept;
    });
    setPlaying((name) => {
      if (name === null || present.has(name)) return name;
      latest.current += 1;
      stopFileAudition();
      setAudition(null);
      return null;
    });
  }, [pack, files]);

  const stop = useCallback(() => {
    latest.current += 1;
    stopFileAudition();
    setPlaying(null);
    setAudition(null);
  }, []);

  const toggle = useCallback((fileName: string) => {
    if (playing === fileName) { stop(); return; }
    latest.current += 1;
    const press = latest.current;
    setLoading(fileName);
    void (async () => {
      try {
        const bytes = new Uint8Array(await msuStore.readMsuTrackFile(pack, fileName));
        const started = await startFileAudition(fileName, bytes, () => {
          if (latest.current === press) { setPlaying(null); setAudition(null); }
        });
        if (latest.current !== press) { started.stop(); return; }
        setLoops((known) => new Map(known).set(fileName, started.loopSeconds));
        setPlaying(fileName);
        setAudition(started);
      } catch {
        if (latest.current === press) { setPlaying(null); setAudition(null); }
      } finally {
        setLoading((name) => (name === fileName ? null : name));
      }
    })();
  }, [pack, playing, stop]);

  return {
    playing,
    audition,
    loading,
    /** Seconds the file repeats from, null when it declares none, undefined until it has played. */
    loopOf: useCallback((fileName: string) => loops.get(fileName), [loops]),
    toggle,
    stop,
  };
};

export { useFileAudition };
