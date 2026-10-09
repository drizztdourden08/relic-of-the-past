/* @layer renderer-components @kind types */
import type { DropIntent } from '../behavior/drop-intent';
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudLayout, HudNode } from '@rotp/hud';

interface NodeInspectorProps {
  node: HudNode | null;
  doc: HudLayout | null;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  glyphPacks: readonly GlyphPack[];
  selectedId: string | null;
  onSelectNode: (id: string) => void;
  onDrop: (ids: readonly string[], intent: DropIntent) => void;
  reflowWarnings: readonly string[];
}

type InspectorSectionKey = 'identity' | 'placement' | 'layout' | 'sizeBox' | 'appearance' | 'content' | 'data' | 'motion';

export type { InspectorSectionKey, NodeInspectorProps };
