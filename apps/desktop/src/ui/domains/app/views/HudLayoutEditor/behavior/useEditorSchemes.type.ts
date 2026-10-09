/* @layer renderer-components @kind types */
import type { ModernSlot } from '@shared/types/controls';

interface EditorScheme {
  id: string;
  name: string;
  deviceType: 'gamepad' | 'keyboard';
  slots: readonly ModernSlot[];
  layoutId: string;
}

interface EditorSchemes {
  selected: EditorScheme | null;
  assignLayout: (schemeId: string, layoutId: string) => Promise<void>;
}

export type { EditorScheme, EditorSchemes };
