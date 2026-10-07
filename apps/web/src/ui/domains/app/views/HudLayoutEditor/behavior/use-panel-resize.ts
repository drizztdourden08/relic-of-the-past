/* @layer renderer-components @kind hook */
/**
 * The outline and inspector rails' own resize wiring, kept out of the editor's
 * own view (already at its line cap): width comes from the view store,
 * `useResize` (`@ds/primitives/ResizeHandle`) drives the drag itself, and
 * `onPreview` writes straight onto each rail's own inline style so the drag
 * never touches state until the pointer comes up.
 */
import { useRef } from 'react';
import { useResize } from '@ds/primitives/ResizeHandle';
import { PANEL_MAX_WIDTH, PANEL_MIN_WIDTH, useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import type { RefObject } from 'react';
import type { ResizeBinding } from '@ds/primitives/ResizeHandle';

interface PanelResize {
  outlineWidth: number;
  inspectorWidth: number;
  outlineRailRef: RefObject<HTMLElement | null>;
  inspectorRailRef: RefObject<HTMLElement | null>;
  outlineResize: ResizeBinding;
  inspectorResize: ResizeBinding;
}

const usePanelResize = (): PanelResize => {
  const outlineWidth = useHudEditorViewStore((s) => s.outlineWidth);
  const inspectorWidth = useHudEditorViewStore((s) => s.inspectorWidth);
  const setOutlineWidth = useHudEditorViewStore((s) => s.setOutlineWidth);
  const setInspectorWidth = useHudEditorViewStore((s) => s.setInspectorWidth);
  const outlineRailRef = useRef<HTMLElement>(null);
  const inspectorRailRef = useRef<HTMLElement>(null);

  const outlineResize = useResize({
    sizeRef: outlineRailRef,
    axis: 'horizontal',
    min: PANEL_MIN_WIDTH,
    max: PANEL_MAX_WIDTH,
    onPreview: (width) => { if (outlineRailRef.current) outlineRailRef.current.style.width = `${width}px`; },
    onResize: setOutlineWidth,
  });
  // The inspector's handle sits on its OWN left edge, so dragging it right
  // shrinks the panel instead of growing it, so `invert` flips the delta.
  const inspectorResize = useResize({
    sizeRef: inspectorRailRef,
    axis: 'horizontal',
    invert: true,
    min: PANEL_MIN_WIDTH,
    max: PANEL_MAX_WIDTH,
    onPreview: (width) => { if (inspectorRailRef.current) inspectorRailRef.current.style.width = `${width}px`; },
    onResize: setInspectorWidth,
  });

  return {
    outlineWidth, inspectorWidth, outlineRailRef, inspectorRailRef, outlineResize, inspectorResize,
  };
};

export { usePanelResize };
export type { PanelResize };
