/* @layer renderer-app @kind types */
import type { TouchControlsSettings } from '@rotp/features';

/** The shared settings the editor can change; held as a draft until Done. */
type TouchSharedDraft = Pick<
  TouchControlsSettings,
  'buttonStrength' | 'layerOpacity' | 'haptics' | 'snap' | 'menuHoldMs'
>;

/** What the editor has open: a piece, the layer card, the add picker, or nothing. */
type TouchEditorSelection =
  | { kind: 'button'; id: string }
  | { kind: 'movement' }
  | { kind: 'layer' }
  | { kind: 'add' }
  | null;

export type { TouchEditorSelection, TouchSharedDraft };
