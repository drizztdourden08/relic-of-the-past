/* @layer renderer-components @kind hook */
/**
 * Owns only the NAME of the file playing; one-at-a-time is enforced by the engine underneath. The
 * playhead is NOT held here (it would re-render the list every frame); the player reads it off the
 * handle. Repeat points are learned by playing, since reading one costs the whole file.
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
  // Only the newest press may publish what is playing; the engine already silenced older nodes.
  const latest = useRef(0);

  // Nothing should outlive the tab. Leaving the panel is a clear "stop", not a background player.
  useEffect(() => () => { stopFileAudition(); }, []);

  // `files` changing identity means disk moved on. Only what is gone is forgotten: renaming one
  // file while listening to another must not cut the listening short or drop other repeat points.
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
