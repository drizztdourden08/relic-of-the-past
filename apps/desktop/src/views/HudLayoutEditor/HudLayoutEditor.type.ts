/* @layer renderer-components @kind types */
import type { HudLayout } from '@rotp/hud';
import type { Size } from '@rotp/hud';

interface HudLayoutEditorProps {
  layoutId?: string;
  onClose: () => void;
  onCommitted?: (layout: HudLayout) => void;
}

interface EditorRatio {
  id: string;
  label: string;
  view: Size;
}

interface EditorGround {
  file: string;
  label: string;
}

export type { EditorGround, EditorRatio, HudLayoutEditorProps };
