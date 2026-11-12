/* @layer renderer-app @kind types */
import type { TouchControlsSettings } from '@rotp/features';

type TouchSharedDraft = Pick<
  TouchControlsSettings,
  'buttonStrength' | 'layerOpacity' | 'haptics' | 'snap' | 'menuHoldMs'
>;

type TouchEditorSelection =
  | { kind: 'button'; id: string }
  | { kind: 'movement' }
  | { kind: 'layer' }
  | { kind: 'add' }
  | null;

export type { TouchEditorSelection, TouchSharedDraft };
