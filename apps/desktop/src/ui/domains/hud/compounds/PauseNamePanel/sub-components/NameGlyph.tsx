/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { HudImage } from '../../../primitives/HudImage';
import { AMPERSAND_COLS } from '../PauseNamePanel.constants';
import type { NameGlyphProps } from '../PauseNamePanel.type';

const NameGlyph = ({ char, size, spritesBase }: NameGlyphProps) => {
  if (char === ' ') return <HudBox style={{ width: size, height: size }} />;
  if (char === '&') {
    return (
      <HudImage
        src={`${spritesBase}font-symbol-ampersand.png`}
        width={size * AMPERSAND_COLS}
        height={size}
        style={{ display: 'block', imageRendering: 'pixelated' }}
      />
    );
  }
  const code = char.toUpperCase();
  const isLetter = /[A-Z]/.test(code);
  const isDigit = /[0-9]/.test(code);
  if (!isLetter && !isDigit) return <HudBox style={{ width: size, height: size }} />;

  const prefix = isDigit ? 'font-digit' : 'font-letter';
  const suffix = isDigit ? code : code.toLowerCase();

  return (
    <HudImage
      src={`${spritesBase}${prefix}-${suffix}.png`}
      width={size}
      height={size}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
};

export { NameGlyph };
