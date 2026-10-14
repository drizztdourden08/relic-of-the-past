/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { GLYPH_SIZE, PAUSE_DIM_OPACITY } from './PauseText.constants';
import type { PauseTextProps } from './PauseText.type';
import { columnsOf } from './behavior/columns-of';

const stemFor = (char: string): string | null => {
  if (char === '&') return 'font-symbol-ampersand';
  const upper = char.toUpperCase();
  if (/^[A-Z]$/.test(upper)) return `font-letter-${upper.toLowerCase()}`;
  if (/^[0-9]$/.test(upper)) return `font-digit-${upper}`;
  return null;
};

const PauseText = (props: PauseTextProps) => {
  const { text, scale, size = GLYPH_SIZE, dim = false, spritesBase } = props;

  const px = size * scale;

  return (
    <HudBox style={{ display: 'flex', height: px, opacity: dim ? PAUSE_DIM_OPACITY : 1 }}>
      {text.split('').map((char, index) => {
        const stem = stemFor(char);
        if (!stem) return <HudBox key={index} style={{ width: px * columnsOf(char), height: px }} />;
        return (
          <HudImage
            key={index}
            src={`${spritesBase}${stem}.png`}
            width={px * columnsOf(char)}
            height={px}
            block
            pixelated
          />
        );
      })}
    </HudBox>
  );
};

export { PauseText };
