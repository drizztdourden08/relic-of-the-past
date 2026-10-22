/* @layer renderer-components @kind types */
import type { useHudLayoutEditor } from '@app/hud-layout-editing/useHudLayoutEditor';
import type { HudLayout, Size } from '@rotp/hud';

interface HudLayoutEditorProps {
  layoutId?: string;
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

type HudLayoutEditorState = ReturnType<typeof useHudLayoutEditor>;

export type { EditorGround, EditorRatio, HudLayoutEditorProps, HudLayoutEditorState };
