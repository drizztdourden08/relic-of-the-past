/* @layer renderer-hud @kind component */
import { PROMPT_START_H, PROMPT_START_Y, PROMPT_STORY_H, PROMPT_STORY_Y, FRAME_W } from '@rotp/game-data';
import { HudBox } from '../../../../hud/primitives/HudBox';
import { ButtonPrompt } from '../../../../hud/primitives/ButtonPrompt';
import { useButtonGlyphs } from '../../../../hud/views/DialogView/behavior/useButtonGlyphs';
import { PROMPT_INK, PROMPT_STROKE } from '../TitleView.constants';
import type { TitlePromptsProps } from '../TitleView.type';
import './TitlePrompts.css';

const TitlePrompts = ({ geometry, scale }: TitlePromptsProps) => {
  const { glyphsFor } = useButtonGlyphs();
  const left = geometry.frameX * scale;
  const width = FRAME_W * scale;
  const row = (y: number, h: number) => ({ position: 'absolute', left, width, top: (geometry.frameY + y) * scale, height: Math.round(h * scale), display: 'flex', justifyContent: 'center', alignItems: 'center' } as const);
  return (
    <>
      <HudBox className="title-prompt title-prompt--start" style={row(PROMPT_START_Y, PROMPT_START_H)}>
        <ButtonPrompt glyphs={glyphsFor(['a'])} label="Start" height={Math.round(PROMPT_START_H * scale)} ink={PROMPT_INK} stroke={PROMPT_STROKE} />
      </HudBox>
      <HudBox className="title-prompt" style={row(PROMPT_STORY_Y, PROMPT_STORY_H)}>
        <ButtonPrompt glyphs={glyphsFor(['b'])} label="Story" height={Math.round(PROMPT_STORY_H * scale)} ink={PROMPT_INK} stroke={PROMPT_STROKE} />
      </HudBox>
    </>
  );
};

export { TitlePrompts };
