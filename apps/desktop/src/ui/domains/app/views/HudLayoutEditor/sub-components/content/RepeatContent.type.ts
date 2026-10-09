/* @layer renderer-components @kind types */
import type { GlyphPack, HudRepeatSpec } from '@shared/types/hud';

interface RepeatContentProps {
  spec: HudRepeatSpec;
  onChange: (patch: Partial<HudRepeatSpec>) => void;
  scope: Readonly<Record<string, number>>;
  glyphPacks: readonly GlyphPack[];
  insideRepeat?: boolean;
  onSelectNode: (id: string) => void;
}

export type { RepeatContentProps };
