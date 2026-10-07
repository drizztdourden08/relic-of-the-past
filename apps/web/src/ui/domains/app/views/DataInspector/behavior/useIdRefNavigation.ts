/* @layer renderer-app @kind logic */
/**
 * One delegated listener for every id reference on the screen, so the generic
 * composites stay ignorant of navigation: they publish an attribute, this
 * reads it. Capture phase on purpose: a click on a reference must open its
 * target, not select the row, so this runs first and stops the event.
 */
import { useCallback } from 'react';
import { resolveIdRef } from './id-ref-target';
import type { MouseEvent } from 'react';
import type { IdRefTarget } from '../DataInspector.type';

const ID_REF_SELECTOR = '[data-id-ref]';

const markedAncestor = (event: MouseEvent<HTMLElement>): HTMLElement | null => {
  const origin = event.target;
  if (!(origin instanceof Element)) return null;
  return origin.closest<HTMLElement>(ID_REF_SELECTOR);
};

const useIdRefNavigation = (onNavigate: (target: IdRefTarget) => void) => {
  const handleIdRefClickCapture = useCallback((event: MouseEvent<HTMLElement>) => {
    const marked = markedAncestor(event);
    if (!marked) return;
    const target = resolveIdRef(marked.dataset.idRef, marked.dataset.targetKind);
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    onNavigate(target);
  }, [onNavigate]);

  return { handleIdRefClickCapture };
};

export { useIdRefNavigation };
