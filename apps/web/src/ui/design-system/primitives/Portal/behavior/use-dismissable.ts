/* @layer renderer-components @kind hook */
/**
 * The React face of `dismiss-stack`. It is the one thing a layered surface has to do
 * to take part in `Escape` handling, replacing the private `document` listener
 * each of them used to bind. See `dismiss-stack.ts` for why there is only one
 * listener and why level, not mount order, decides who wins.
 *
 * `onDismiss` is read through a ref so a fresh closure on every parent render
 * does not churn the registration. Re-registering would move the entry to the
 * back of its own level's tie-break and, on a re-render mid-press, hand the key
 * to the wrong surface.
 */
import { useEffect, useRef } from 'react';
import { pushDismissable } from './dismiss-stack';
import type { DismissLevel } from './dismiss-stack';

interface UseDismissableParams {
  /** Registered only while this is true, because a closed surface owns no key. */
  active: boolean;
  level: DismissLevel;
  onDismiss: () => void;
}

const useDismissable = (params: UseDismissableParams): void => {
  const { active, level, onDismiss } = params;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!active) return undefined;
    return pushDismissable(level, () => onDismissRef.current());
  }, [active, level]);
};

export { useDismissable };
export type { UseDismissableParams };
