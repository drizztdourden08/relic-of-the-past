/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import { diffsByRecordFrom } from '@rotp/navigation';
import type { DetectionContext, Difference } from '@rotp/navigation';
import { useContextSignature } from './useContextSignature';

const useComparison = (context: DetectionContext): ReadonlyMap<string, ReadonlyMap<string, Difference>> => {
  const signature = useContextSignature(context);
  return useMemo(() => diffsByRecordFrom(context), [signature]);
};

export { useComparison };
