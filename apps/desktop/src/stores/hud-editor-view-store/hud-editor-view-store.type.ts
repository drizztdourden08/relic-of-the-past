/* @layer renderer-stores @kind types */
interface GridEcho {
  containerId: string;
  c0: number;
  c1: number;
  r0: number;
  r1: number;
}

interface FlexEcho {
  containerId: string;
  childIds: readonly string[];
}

interface HudEditorViewState {
  gridOverlayEnabled: boolean;
  snappingEnabled: boolean;
  outlineWidth: number;
  inspectorWidth: number;
  collapsedNodeIds: ReadonlySet<string>;
  gridEcho: GridEcho | null;
  flexEcho: FlexEcho | null;
  editorStep: number;
}

interface HudEditorViewStore extends HudEditorViewState {
  toggleGridOverlay: () => void;
  toggleSnapping: () => void;
  setOutlineWidth: (px: number) => void;
  setInspectorWidth: (px: number) => void;
  toggleNodeCollapsed: (id: string) => void;
  expandNodeIds: (ids: readonly string[]) => void;
  collapseNodeIds: (ids: readonly string[]) => void;
  setGridEcho: (echo: GridEcho | null) => void;
  setFlexEcho: (echo: FlexEcho | null) => void;
  setEditorStep: (step: number) => void;
}

export type { FlexEcho, GridEcho, HudEditorViewStore };
