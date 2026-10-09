/* @layer renderer-widgets @kind hook */
import { useSyncExternalStore } from 'react';
import { dataRevision, subscribeDataRevision } from '@app/lib/game/data-revision';
import type { DetectionContext } from '@shared/game/recommendations';
import { signatureOf } from './context-signature';

const useContextSignature = (context: DetectionContext): string => {
  useSyncExternalStore(subscribeDataRevision, dataRevision, dataRevision);
  return signatureOf(context);
};

export { useContextSignature };
