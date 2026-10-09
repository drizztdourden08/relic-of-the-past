/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import * as msuStore from '@app/lib/storage/msu-store';

const useFileLoopSamples = (pack: string, fileNames: string[]): Map<string, number | null> => {
  const [samples, setSamples] = useState<Map<string, number | null>>(new Map());
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
