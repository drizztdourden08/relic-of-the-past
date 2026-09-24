/* @layer renderer-hud @kind component */
/**
 * The prompts under the finished title: the confirm button and "Start", flashing the way the pause
 * cursor does, and a smaller line with the cancel button for the story. Placed against the 256x224
 * frame in CSS pixels, over the canvas.
 */
import { PROMPT_START_H, PROMPT_START_Y, PROMPT_STORY_H, PROMPT_STORY_Y, FRAME_W } from '@shared/game/title/title-layout';
import { HudBox } from '../../../../hud/primitives/HudBox';
import { ButtonPrompt } from '../../../../hud/primitives/ButtonPrompt';
import { useButtonGlyphs } from '../../../../hud/views/DialogView/behavior/useButtonGlyphs';
import type { SceneGeometry } from '../../../scene/scene.type';
import './TitlePrompts.css';

interface TitlePromptsProps {
  geometry: SceneGeometry;
  /** CSS pixels per game pixel. */
  scale: number;
}

const INK = '#ffffff';
const STROKE = '#1c1a3a';

const TitlePrompts = ({ geometry, scale }: TitlePromptsProps) => {
  const { glyphsFor } = useButtonGlyphs();
  const left = geometry.frameX * scale;
  const width = FRAME_W * scale;
  const row = (y: number, h: number) => ({ position: 'absolute', left, width, top: (geometry.frameY + y) * scale, height: Math.round(h * scale), display: 'flex', justifyContent: 'center', alignItems: 'center' } as const);
  return (
    <>
      <HudBox className="title-prompt title-prompt--start" style={row(PROMPT_START_Y, PROMPT_START_H)}>
        <ButtonPrompt glyphs={glyphsFor(['a'])} label="Start" height={Math.round(PROMPT_START_H * scale)} ink={INK} stroke={STROKE} />
      </HudBox>
      <HudBox className="title-prompt" style={row(PROMPT_STORY_Y, PROMPT_STORY_H)}>
        <ButtonPrompt glyphs={glyphsFor(['b'])} label="Story" height={Math.round(PROMPT_STORY_H * scale)} ink={INK} stroke={STROKE} />
      </HudBox>
    </>
  );
};

export { TitlePrompts };
export type { TitlePromptsProps };
