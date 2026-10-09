/* @layer renderer-hud @kind types */
import type { PromptGlyph } from '../../primitives/ButtonPrompt';
import type { CssRect } from '../DialogBox';

interface ResolvedPrompt {
  glyphs: PromptGlyph[];
  label: string;
  hold?: boolean;
}

interface DialogPromptsProps {
  prompts: ResolvedPrompt[];
  box: CssRect;
  limit: number;
  scale: number;
  ink: string;
  stroke: string;
}

export type { DialogPromptsProps, ResolvedPrompt };
