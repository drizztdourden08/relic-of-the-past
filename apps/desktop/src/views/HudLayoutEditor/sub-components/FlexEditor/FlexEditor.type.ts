/* @layer renderer-components @kind types */
import type { EditorAction, EditorShortcut } from '@app/hud-layout-editing/selection-bands.type';
import type { IndexRun } from '@app/hud-layout-editing/index-selection';
import type { DropIntent } from '@app/hud-layout-editing/drop-intent';
import type { HudFlexContainer } from '@rotp/hud';

type FlexSelection = { kind: 'none' } | ({ kind: 'items' } & IndexRun);

interface FlexEditorEdits {
  move: (index: number, to: number) => void;
  setSelection: (next: FlexSelection) => void;
  refuse: (reason: string) => void;
}

interface FlexActionContext {
  container: HudFlexContainer;
  selection: FlexSelection;
  edits: FlexEditorEdits;
}

interface FlexEditorProps {
  container: HudFlexContainer;
  onDrop?: (ids: readonly string[], intent: DropIntent) => void;
}

export type { EditorAction, EditorShortcut, FlexActionContext, FlexEditorEdits, FlexEditorProps, FlexSelection };
