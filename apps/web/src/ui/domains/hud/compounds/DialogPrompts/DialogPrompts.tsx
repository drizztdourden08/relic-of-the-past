/* @layer renderer-hud @kind component */
/**
 * The row of button prompts under a message box, right-aligned to the box's right edge. When the box
 * sits too low for the row to fit below it, the row moves above the box instead.
 */
import { HudBox } from '../../primitives/HudBox';
import { ButtonPrompt } from '../../primitives/ButtonPrompt';
import type { PromptGlyph } from '../../primitives/ButtonPrompt';
import type { CssRect } from '../DialogBox';

interface ResolvedPrompt {
  glyphs: PromptGlyph[];
  label: string;
  hold?: boolean;
}

interface DialogPromptsProps {
  prompts: ResolvedPrompt[];
  /** The message box, in CSS pixels. */
  box: CssRect;
  /** Height of the drawable area the row must stay inside, in CSS pixels. */
  limit: number;
  /** CSS pixels per game pixel. */
  scale: number;
  ink: string;
  stroke: string;
}

/** Prompt height, the space between the box and the row, and between prompts, in game pixels. */
const PROMPT_HEIGHT_PX = 10;
const GAP_PX = 2;
const SPACING_PX = 6;

const DialogPrompts = (props: DialogPromptsProps) => {
  const { prompts, box, limit, scale, ink, stroke } = props;
  if (prompts.length === 0) return null;
  const height = Math.round(PROMPT_HEIGHT_PX * scale);
  const gap = GAP_PX * scale;
  const below = box.y + box.h + gap;
  const top = below + height <= limit ? below : box.y - gap - height;
  return (
    <HudBox
      style={{
        position: 'absolute', top, right: `calc(100% - ${box.x + box.w}px)`, height,
        display: 'flex', alignItems: 'center', gap: SPACING_PX * scale, pointerEvents: 'none',
      }}
    >
      {prompts.map((prompt) => (
        <ButtonPrompt key={prompt.label} glyphs={prompt.glyphs} label={prompt.label} hold={prompt.hold} height={height} ink={ink} stroke={stroke} />
      ))}
    </HudBox>
  );
};

export { DialogPrompts };
export type { DialogPromptsProps, ResolvedPrompt };
