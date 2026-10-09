/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { ButtonPrompt } from '../../primitives/ButtonPrompt';
import { GAP_PX, PROMPT_HEIGHT_PX, SPACING_PX } from './DialogPrompts.constants';
import type { DialogPromptsProps } from './DialogPrompts.type';

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
