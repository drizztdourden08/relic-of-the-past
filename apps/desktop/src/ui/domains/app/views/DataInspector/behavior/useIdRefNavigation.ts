/* @layer renderer-app @kind hook */
import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import type { IdRefTarget } from '../DataInspector.type';
import { resolveIdRef } from './id-ref-target';
import { markedAncestor } from './marked-ancestor';

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
