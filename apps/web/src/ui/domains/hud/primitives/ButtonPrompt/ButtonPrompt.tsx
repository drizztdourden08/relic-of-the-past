/* @layer renderer-hud @kind component */
import { HudBox } from '../HudBox';
import { HudImage } from '../HudImage';
import { keycapStyle } from './behavior/keycap-style';
import { promptTextStyle } from './behavior/prompt-text-style';
import type { ButtonPromptProps } from './ButtonPrompt.type';

const ButtonPrompt = (props: ButtonPromptProps) => {
  const { glyphs, label, hold, height, ink, stroke } = props;
  const text = promptTextStyle(height, ink, stroke);
  const gap = Math.round(height / 5);
  return (
    <HudBox style={{ display: 'flex', alignItems: 'center', gap }}>
      {hold && <HudBox as="span" style={text}>Hold</HudBox>}
      {glyphs.map((glyph, index) => (glyph.src
        ? <HudImage key={index} src={glyph.src} alt={glyph.label} style={{ display: 'block', height, width: 'auto' }} />
        : <HudBox key={index} as="span" style={keycapStyle(height, ink, stroke)}>{glyph.label}</HudBox>
      ))}
      <HudBox as="span" style={text}>{label}</HudBox>
    </HudBox>
  );
};

export { ButtonPrompt };
