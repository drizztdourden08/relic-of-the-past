/* @layer renderer-components @kind types */
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudSwitchSpec } from '@rotp/hud';

interface SwitchContentProps {
  spec: HudSwitchSpec;
  onChange: (patch: Partial<HudSwitchSpec>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  glyphPacks: readonly GlyphPack[];
  selectedId: string | null;
  onSelectNode: (id: string) => void;
}

export type { SwitchContentProps };
