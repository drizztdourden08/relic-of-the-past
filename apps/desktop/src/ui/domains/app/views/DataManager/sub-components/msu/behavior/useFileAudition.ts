/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as msuStore from '@app/lib/storage/msu-store';
import { startFileAudition, stopFileAudition } from '@rotp/design/packs';
import type { Audition } from '@rotp/design/packs';
import type { MsuFile } from '../msu.type';

const useFileAudition = (pack: string, files: MsuFile[]) => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [audition, setAudition] = useState<Audition | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [loops, setLoops] = useState<Map<string, number | null>>(new Map());
  const latest = useRef(0);

  useEffect(() => () => { stopFileAudition(); }, []);

  const shownPack = useRef(pack);
  useEffect(() => {
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
    loopOf: useCallback((fileName: string) => loops.get(fileName), [loops]),
    toggle,
    stop,
  };
};

export { useFileAudition };
