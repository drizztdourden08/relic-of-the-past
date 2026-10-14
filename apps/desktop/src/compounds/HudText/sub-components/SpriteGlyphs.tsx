/* @layer renderer-hud @kind component */
import { columnsForSpriteChar, stemForSpriteChar } from '@rotp/hud';
import { HudBox } from '../../../primitives/HudBox';
import { HudImage } from '../../../primitives/HudImage';
import type { SpriteGlyphsProps } from '../HudText.type';

const SpriteGlyphs = (props: SpriteGlyphsProps) => {
  const { text, face, scale, spritesBase } = props;
  const tile = 8 * scale;
  return (
    <HudBox style={{ display: 'flex', height: tile }}>
      {text.split('').map((char, i) => {
        const stem = stemForSpriteChar(face.set, char);
        const width = tile * columnsForSpriteChar(char);
        if (!stem) return <HudBox key={i} style={{ width, height: tile }} />;
        return (
          <HudImage
            key={i}
            src={`${spritesBase}${stem}.png`}
            width={width}
            height={tile}
            pixelated
          />
        );
      })}
    </HudBox>
  );
};

export { SpriteGlyphs };
