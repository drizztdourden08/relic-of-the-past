/**
 * PauseNamePanel — shows the selected item's name.
 *
 * Game layout: tiles (21,5)→(30,10) = 10×6 tiles
 * Displays the item name using font sprites,
 * with the item's icon sprite above the text.
 */
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: innerCols * tile,
        gap: `${tile}px`,
      }}>
        {/* Item icon (16×16 SNES pixels) */}
        {itemSprite && (
          <img
            src={`${spritesBase}${itemSprite}.png`}
            width={tile * 2}
            height={tile * 2}
            draggable={false}
            style={{ display: 'block', imageRendering: 'pixelated', alignSelf: 'center' }}
          />
        )}

        {/* Item name rendered as font sprites */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
        }}>
          {itemName.split('').map((char, idx) => {
            if (char === ' ') {
              return <div key={idx} style={{ width: tile, height: tile }} />;
            }
            const code = char.toUpperCase();
            const isLetter = /[A-Z]/.test(code);
            const isDigit = /[0-9]/.test(code);
            if (!isLetter && !isDigit) return <div key={idx} style={{ width: tile, height: tile }} />;

            const prefix = isDigit ? 'font-digit' : 'font-letter';
            const suffix = isDigit ? code : code.toLowerCase();

            return (
              <img
                key={idx}
                src={`${spritesBase}${prefix}-${suffix}.png`}
                width={tile}
                height={tile}
                draggable={false}
                style={{ display: 'block', imageRendering: 'pixelated' }}
              />
            );
          })}
        </div>
      </div>
    </PauseBorderBox>
  );
};

export { PauseNamePanel };
export type { PauseNamePanelProps };
