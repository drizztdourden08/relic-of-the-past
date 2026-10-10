/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { ancestorIdsOf } from './tree-context';
import { SPRING_MS } from './spring-load.constants';
import type { SpringLoad, SpringLoadInput } from './spring-load.type';

const useSpringLoad = (input: SpringLoadInput): SpringLoad => {
  const { doc, active, rowId } = input;
  const collapsedNodeIds = useHudEditorViewStore((s) => s.collapsedNodeIds);
  const expandNodeIds = useHudEditorViewStore((s) => s.expandNodeIds);
  const collapseNodeIds = useHudEditorViewStore((s) => s.collapseNodeIds);
  const [pending, setPending] = useState<string | null>(null);
  const sprung = useRef<string[]>([]);
  const where = useRef<string | null>(null);
  const state = useRef({ doc, collapsedNodeIds, expandNodeIds, collapseNodeIds });
  state.current = { doc, collapsedNodeIds, expandNodeIds, collapseNodeIds };

  const waiting = active && rowId !== null && collapsedNodeIds.has(rowId) ? rowId : null;

  useEffect(() => {
    setPending(waiting);
    if (waiting === null) return undefined;
    const timer = setTimeout(() => {
      sprung.current = [...sprung.current, waiting];
      setPending(null);
      state.current.expandNodeIds([waiting]);
    }, SPRING_MS);
    return () => clearTimeout(timer);
  }, [waiting]);

  useEffect(() => {
    if (active) return;
    const opened = sprung.current;
    sprung.current = [];
    const landing = where.current;
    where.current = null;
    if (opened.length === 0) return;
    const keep = new Set(landing ? [landing, ...ancestorIdsOf(state.current.doc, landing)] : []);
    const back = opened.filter((id) => !keep.has(id));
    if (back.length > 0) state.current.collapseNodeIds(back);
  }, [active]);

  const landed = useCallback((parentId: string | null) => { where.current = parentId; }, []);

  return { pending, landed };
};

export { useSpringLoad };
export type { SpringLoad, SpringLoadInput } from './spring-load.type';
