/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import type { NameLineProps } from '../PauseNamePanel.type';
import { NameGlyph } from './NameGlyph';
import './NameLine.css';

const NameLine = ({ line, glyphSize, spritesBase }: NameLineProps) => (
  <HudBox className="pause-name-line">
    {line.split('').map((char, idx) => (
      <NameGlyph key={idx} char={char} size={glyphSize} spritesBase={spritesBase} />
    ))}
  </HudBox>
);

export { NameLine };
