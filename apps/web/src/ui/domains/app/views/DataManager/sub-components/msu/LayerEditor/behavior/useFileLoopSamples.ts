/* @layer renderer-components @kind hook */
/**
 * The loop point each of these files declares, for showing what a slot ALREADY does before anyone
 * sets anything.
 *
 * Without this the "Repeat from" field opened at 0 on a track that plainly repeats from 13 seconds:
 * the manifest had no loop point, so the field showed the manifest, while the value actually in
 * force was the one inside the `.pcm` header. Reading it here means the control opens on the
 * effective value, and an author editing it starts from what they can hear rather than from zero.
 *
 * Takes the whole set rather than one name so the editor can resolve every layer in one hook — one
 * per layer is not something a component can do in a loop. Only `.pcm` costs a read; every other
 * format answers null without being opened.
 */
import { useEffect, useState } from 'react';
import * as msuStore from '@app/lib/storage/msu-store';

const useFileLoopSamples = (pack: string, fileNames: string[]): Map<string, number | null> => {
  const [samples, setSamples] = useState<Map<string, number | null>>(new Map());
  // Names arrive as a fresh array each render; the joined key is what actually changed.
  const key = fileNames.join('\u0000');

  useEffect(() => {
    const wanted = key.length === 0 ? [] : key.split('\u0000');
    if (wanted.length === 0) {
      setSamples(new Map());
      return undefined;
    }
    let cancelled = false;
    void Promise.all(wanted.map(async (name) => {
      const value = await msuStore.readMsuLoopSample(pack, name).catch(() => null);
      return [name, value] as const;
    })).then((pairs) => { if (!cancelled) setSamples(new Map(pairs)); });
    return () => { cancelled = true; };
  }, [pack, key]);

  return samples;
};

export { useFileLoopSamples };
