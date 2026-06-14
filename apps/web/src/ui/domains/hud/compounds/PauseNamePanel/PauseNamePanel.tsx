/* @layer renderer-hud @kind component */
/**
 * PauseNamePanel — shows the selected item's name.
 *
 * Game layout: tiles (21,5)→(30,10) = 10×6 tiles
 * Displays the item name using font sprites,
 * with the item's icon sprite above the text.
 */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';

interface PauseNamePanelProps {
  itemName: string;
  itemSprite: string | null;
  borderColor?: 'green' | 'blue' | 'gray' | 'yellow' | 'red';
  scale: number;
  spritesBase: string;
  style?: React.CSSProperties;
}

const PauseNamePanel = ({ itemName, itemSprite, borderColor = 'green', scale, spritesBase, style }: PauseNamePanelProps) => {
  const tile = 8 * scale;
  // Box: 8 inner cols × 4 inner rows (+ 2 border = 10×6)
  const innerCols = 8;
  const innerRows = 4;

  return (
    <PauseBorderBox color={borderColor} cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase} style={style}>
      {/* Item icon + name */}
      <HudBox style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: innerCols * tile,
        gap: `${tile}px`,
      }}>
        {/* Item icon (16×16 SNES pixels) */}
        {itemSprite && (
          <HudImage
            src={`${spritesBase}${itemSprite}.png`}
            width={tile * 2}
            height={tile * 2}
            style={{ display: 'block', imageRendering: 'pixelated', alignSelf: 'center' }}
          />
        )}

        {/* Item name rendered as font sprites */}
        <HudBox style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
        }}>
          {itemName.split('').map((char, idx) => {
            if (char === ' ') {
              return <HudBox key={idx} style={{ width: tile, height: tile }} />;
            }
            const code = char.toUpperCase();
            const isLetter = /[A-Z]/.test(code);
            const isDigit = /[0-9]/.test(code);
            if (!isLetter && !isDigit) return <HudBox key={idx} style={{ width: tile, height: tile }} />;

            const prefix = isDigit ? 'font-digit' : 'font-letter';
            const suffix = isDigit ? code : code.toLowerCase();

            return (
              <HudImage
                key={idx}
                src={`${spritesBase}${prefix}-${suffix}.png`}
                width={tile}
                height={tile}
                style={{ display: 'block', imageRendering: 'pixelated' }}
              />
            );
          })}
        </HudBox>
      </HudBox>
    </PauseBorderBox>
  );
};

export { PauseNamePanel };
export type { PauseNamePanelProps };
