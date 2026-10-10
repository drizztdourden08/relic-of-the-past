/* @layer renderer-components @kind hook */
import { PANEL_MAX_WIDTH, PANEL_MIN_WIDTH, useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import type { PanelResize } from './panel-resize.type';

const usePanelResize = (): PanelResize => {
  const outlineWidth = useHudEditorViewStore((s) => s.outlineWidth);
  const inspectorWidth = useHudEditorViewStore((s) => s.inspectorWidth);
  const setOutlineWidth = useHudEditorViewStore((s) => s.setOutlineWidth);
  const setInspectorWidth = useHudEditorViewStore((s) => s.setInspectorWidth);

  return {
    outlineWidth,
    inspectorWidth,
    outlineResize: { value: outlineWidth, min: PANEL_MIN_WIDTH, max: PANEL_MAX_WIDTH, onResize: setOutlineWidth },
    inspectorResize: { value: inspectorWidth, min: PANEL_MIN_WIDTH, max: PANEL_MAX_WIDTH, onResize: setInspectorWidth },
  };
};

export { usePanelResize };
export type { PanelResize } from './panel-resize.type';
