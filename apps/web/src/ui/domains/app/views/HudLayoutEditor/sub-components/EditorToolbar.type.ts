/* @layer renderer-components @kind types */
import type { EditorGround, EditorRatio } from '../HudLayoutEditor.constants';
import type { GlyphPack, HudLayout, HudNode } from '@shared/types/hud';

interface EditorToolbarProps {
  insert: (node: HudNode) => void;
  layouts: readonly HudLayout[];
  draftId: string;
  onStartFrom: (layout: HudLayout) => void;
  slotNumbers: readonly number[];
  glyphPacks: readonly GlyphPack[];
  ratio: EditorRatio;
  onRatioChange: (id: string) => void;
  ground: EditorGround | null;
  onGroundChange: (file: string) => void;
  targetLabel: string;
}

export type { EditorToolbarProps };
