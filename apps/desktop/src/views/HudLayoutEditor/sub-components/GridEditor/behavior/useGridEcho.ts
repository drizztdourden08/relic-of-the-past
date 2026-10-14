/* @layer renderer-components @kind hook */
import { useEffect, useMemo } from 'react';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { selectionBounds } from './selection-bounds';
import type { GridSelection } from '../GridEditor.type';

const useGridEcho = (containerId: string, selection: GridSelection, columns: number, rows: number): void => {
  const setGridEcho = useHudEditorViewStore((s) => s.setGridEcho);
  const echo = useMemo(() => selectionBounds(selection, columns, rows), [columns, selection, rows]);
  useEffect(() => {
    setGridEcho(echo ? { containerId, ...echo } : null);
    return () => setGridEcho(null);
  }, [containerId, echo, setGridEcho]);
};

export { useGridEcho };
