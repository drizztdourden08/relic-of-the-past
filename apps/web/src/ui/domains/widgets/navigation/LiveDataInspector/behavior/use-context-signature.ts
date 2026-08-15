/* @layer renderer-widgets @kind hook */
/**
 * `signatureOf`, wired to the dataset revision it reads.
 *
 * The signature folds `dataRevision()` in, but a module counter only reaches a
 * component that happens to be rendering. Subscribing here is what makes an
 * accepted finding or a hand-edited record re-run detection immediately, rather
 * than only once a game frame or another store re-renders the widget — which,
 * with the emulator paused, may never happen.
 */
import { useSyncExternalStore } from 'react';
import { dataRevision, subscribeDataRevision } from '@app/lib/game/data-revision';
import type { DetectionContext } from '@shared/game/recommendations';
import { signatureOf } from './context-signature';

const useContextSignature = (context: DetectionContext): string => {
  useSyncExternalStore(subscribeDataRevision, dataRevision, dataRevision);
  return signatureOf(context);
};

export { useContextSignature };
