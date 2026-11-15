/* @layer renderer-components @kind types */
import type { GlyphMap } from '@rotp/asset-extraction';
import type { TextGroup } from '@rotp/languages';

type EditorTabsParams = {
  dialogueCount: number;
  variableCount: number;
  groups: TextGroup[];
  glyphs: GlyphMap | undefined;
};

export type { EditorTabsParams };
