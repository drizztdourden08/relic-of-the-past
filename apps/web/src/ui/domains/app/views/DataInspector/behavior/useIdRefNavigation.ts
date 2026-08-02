/* @layer renderer-app @kind logic */
/**
 * One delegated listener for every id reference on the screen, wherever it was
 * rendered — a table cell, a nested fallback in the editor. Delegation rather
 * than a per-cell handler is what lets the generic composites stay ignorant of
 * navigation: they publish an attribute, this reads it.
 *
 * It listens on the CAPTURE phase deliberately. A row's own click selects that
 * row, and a click on a reference inside it means "open what this points at",
 * not "select the row I am in" — capturing lets this run first and stop the
 * event before the row ever sees it.
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
