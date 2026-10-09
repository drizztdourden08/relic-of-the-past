/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { AMPERSAND_COLS } from './PauseNamePanel.constants';
import type { PauseNamePanelProps } from './PauseNamePanel.type';
import { NameLine } from './sub-components/NameLine';

const PauseNamePanel = ({ itemName, itemSprite, borderColor = 'green', scale, spritesBase, style }: PauseNamePanelProps) => {
  const tile = 8 * scale;
  const innerCols = 8;
  const innerRows = 4;
  const lines = Array.isArray(itemName) ? itemName : [itemName];
  const lineWidth = (line: string): number =>
    line.split('').reduce((cols, char) => cols + (char === '&' ? AMPERSAND_COLS : 1), 0);
  const longestLine = Math.max(...lines.map(lineWidth));
  const glyphSize = longestLine > innerCols ? (tile * innerCols) / longestLine : tile;

  return (
    <PauseBorderBox color={borderColor} cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase} style={style}>
      <HudBox style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: innerCols * tile,
      }}>
        {itemSprite && (
          <HudImage
            src={`${spritesBase}${itemSprite}.png`}
            width={tile * 2}
            height={tile * 2}
            style={{ display: 'block', imageRendering: 'pixelated', alignSelf: 'center' }}
          />
        )}

        <HudBox style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          height: tile * 2,
          overflow: 'hidden',
        }}>
          {lines.map((line, idx) => (
            <NameLine key={idx} line={line} glyphSize={glyphSize} spritesBase={spritesBase} />
          ))}
        </HudBox>
      </HudBox>
    </PauseBorderBox>
  );
};

export { PauseNamePanel };
