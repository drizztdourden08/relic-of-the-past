/* @layer renderer-components @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';
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
  label: Text;
}

type HudLayoutEditorState = ReturnType<typeof useHudLayoutEditor>;

export type { EditorGround, EditorRatio, HudLayoutEditorProps, HudLayoutEditorState };
