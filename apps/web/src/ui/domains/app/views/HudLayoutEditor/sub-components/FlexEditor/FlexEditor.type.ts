/* @layer renderer-components @kind types */
import type { EditorAction, EditorShortcut } from '../SelectionBands';
import type { IndexRun } from '../../behavior/index-selection';
import type { DropIntent } from '../../behavior/drop-intent';
import type { HudFlexContainer } from '@shared/types/hud';

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
