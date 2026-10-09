/* @layer renderer-components @kind hook */
import { useRef } from 'react';
import { useResize } from '@drizztdourden08/tessera/primitives';
import { PANEL_MAX_WIDTH, PANEL_MIN_WIDTH, useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import type { PanelResize } from './usePanelResize.type';

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
export type { PanelResize } from './usePanelResize.type';
