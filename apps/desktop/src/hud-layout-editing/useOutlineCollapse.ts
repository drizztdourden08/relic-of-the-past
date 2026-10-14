/* @layer renderer-components @kind hook */
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';

const useOutlineCollapse = () => ({
  collapsedNodeIds: useHudEditorViewStore((s) => s.collapsedNodeIds),
  toggleNodeCollapsed: useHudEditorViewStore((s) => s.toggleNodeCollapsed),
  expandNodeIds: useHudEditorViewStore((s) => s.expandNodeIds),
});

export { useOutlineCollapse };
