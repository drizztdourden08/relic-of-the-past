/* @layer renderer-components @kind types */
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudNode } from '@rotp/hud';

interface CaseBranchProps {
  node: HudNode;
  label: string;
  glyphPacks: readonly GlyphPack[];
  onSelectNode: (id: string) => void;
}

export type { CaseBranchProps };
