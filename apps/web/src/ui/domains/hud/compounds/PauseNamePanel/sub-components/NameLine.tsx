/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import type { NameLineProps } from '../PauseNamePanel.type';
import { NameGlyph } from './NameGlyph';

const NameLine = ({ line, glyphSize, spritesBase }: NameLineProps) => (
  <HudBox style={{ display: 'flex' }}>
    {line.split('').map((char, idx) => (
      <NameGlyph key={idx} char={char} size={glyphSize} spritesBase={spritesBase} />
    ))}
  </HudBox>
);

export { NameLine };
