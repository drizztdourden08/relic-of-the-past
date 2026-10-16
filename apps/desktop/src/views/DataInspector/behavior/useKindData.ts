/* @layer renderer-app @kind hook */
import { useEffect, useState } from 'react';
import type { EntityKind } from '@rotp/game-data';
import type { KindData } from '../DataInspector.type';
import { loadKindData, peekKindData } from './kind-data';
import { scheduleAfterPaint } from './schedule-after-paint';

const useKindData = (kind: EntityKind | null): KindData | undefined => {
  const [loaded, setLoaded] = useState<KindData | undefined>(undefined);
  const ready = kind ? peekKindData(kind) : undefined;

  useEffect(() => {
    if (!kind || peekKindData(kind)) return undefined;
    return scheduleAfterPaint(() => setLoaded(loadKindData(kind)));
  }, [kind]);

  return ready ?? (loaded && loaded.source.id === kind ? loaded : undefined);
};

export { useKindData };
