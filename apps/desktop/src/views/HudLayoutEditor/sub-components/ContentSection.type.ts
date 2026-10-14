/* @layer renderer-components @kind types */
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudElement, HudElementSpec } from '@rotp/hud';

interface ContentSectionProps {
  node: HudElement;
  onPatch: (patch: Partial<HudElement>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  glyphPacks: readonly GlyphPack[];
  selectedId: string | null;
  onSelectNode: (id: string) => void;
}

type SetElement = <T extends HudElementSpec>(patch: Partial<T>) => void;

type StructuralSpec = Extract<HudElementSpec, { type: 'button' | 'countdown' | 'repeat' | 'switch' | 'spacer' }>;

interface StructuralContentProps {
  element: StructuralSpec;
  onChange: SetElement;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  glyphPacks: readonly GlyphPack[];
  selectedId: string | null;
  onSelectNode: (id: string) => void;
}

export type { ContentSectionProps, SetElement, StructuralContentProps, StructuralSpec };
