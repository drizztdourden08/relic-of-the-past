/* @layer renderer-components @kind types */
import type { GlyphPack, HudElement } from '@shared/types/hud';

interface ContentSectionProps {
  node: HudElement;
  onPatch: (patch: Partial<HudElement>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  glyphPacks: readonly GlyphPack[];
  selectedId: string | null;
  onSelectNode: (id: string) => void;
}

export type { ContentSectionProps };
