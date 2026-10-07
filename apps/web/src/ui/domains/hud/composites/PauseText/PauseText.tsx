/* @layer renderer-hud @kind component */
/**
 * PauseText draws one line of the game's own font, composed from extracted sprites.
 *
 * The enhanced menu writes far more words than the six pre-composed label
 * strips cover (three screen names, three gear ladders, the status rows and the
 * two actions), so it draws them a character at a time out of the same font
 * tiles the name panel uses. Everything it can draw is A-Z, 0-9, space and '&';
 * anything else takes a blank column instead of a broken image, which is the
 * same contract the name panel's own glyph has.
 *
 * Folding a translated string down to that set is the CALLER's job. The view
 * owns the name tables and already folds through `wrapName`. Keeping the fold
 * out here is what lets this stay a bare compound with no data of its own.
 */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { AMPERSAND_COLUMNS, GLYPH_SIZE, PAUSE_DIM_OPACITY } from './PauseText.constants';
import type { PauseTextProps } from './PauseText.type';

/** Sprite stem for one character, or null when nothing can be drawn for it. */
const stemFor = (char: string): string | null => {
  if (char === '&') return 'font-symbol-ampersand';
  const upper = char.toUpperCase();
  if (/^[A-Z]$/.test(upper)) return `font-letter-${upper.toLowerCase()}`;
  if (/^[0-9]$/.test(upper)) return `font-digit-${upper}`;
  return null;
};

/** How many columns a character occupies. Only '&' is wider than one. */
const columnsOf = (char: string): number => (char === '&' ? AMPERSAND_COLUMNS : 1);

/** A line's width in SNES pixels. The screens lay themselves out against this. */
const pauseTextWidth = (text: string, size: number = GLYPH_SIZE): number =>
  text.split('').reduce((cols, char) => cols + columnsOf(char), 0) * size;

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
            style={{ display: 'block', imageRendering: 'pixelated' }}
          />
        );
      })}
    </HudBox>
  );
};

export { PauseText, pauseTextWidth };
