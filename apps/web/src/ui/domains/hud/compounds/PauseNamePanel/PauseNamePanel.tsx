/* @layer renderer-hud @kind component */
/**
 * Shows the selected item's name with its icon sprite above the text.
 * Game layout: tiles (21,5)→(30,10) = 10×6 tiles
 */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';

interface PauseNamePanelProps {
  itemName: string | string[];
  itemSprite: string | null;
  borderColor?: 'green' | 'blue' | 'gray' | 'yellow' | 'red';
  scale: number;
  spritesBase: string;
  style?: React.CSSProperties;
}

/** '&' is drawn across 2 native tiles in the ROM's own font data, so its sprite is twice as wide as every other glyph. */
const AMPERSAND_COLS = 2;

const Glyph = ({ char, size, spritesBase }: { char: string; size: number; spritesBase: string }) => {
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

/** Renders one name line at the shared glyph size computed for the whole name (see PauseNamePanel). */
const NameLine = ({ line, glyphSize, spritesBase }: { line: string; glyphSize: number; spritesBase: string }) => (
  <HudBox style={{ display: 'flex' }}>
    {line.split('').map((char, idx) => (
      <Glyph key={idx} char={char} size={glyphSize} spritesBase={spritesBase} />
    ))}
  </HudBox>
);

const PauseNamePanel = ({ itemName, itemSprite, borderColor = 'green', scale, spritesBase, style }: PauseNamePanelProps) => {
  const tile = 8 * scale;
  // Box: 8 inner cols × 4 inner rows (+ 2 border = 10×6)
  const innerCols = 8;
  const innerRows = 4;
  const lines = Array.isArray(itemName) ? itemName : [itemName];
  // One shared size for every line: the caller already broke the name onto this grid
  // (see the view's wrap-name), so a line still wider than the box shrinks the whole
  // name, keeping every row at the same scale. '&' counts as 2 columns (AMPERSAND_COLS).
  const lineWidth = (line: string): number =>
    line.split('').reduce((cols, char) => cols + (char === '&' ? AMPERSAND_COLS : 1), 0);
  const longestLine = Math.max(...lines.map(lineWidth));
  const glyphSize = longestLine > innerCols ? (tile * innerCols) / longestLine : tile;

  return (
    <PauseBorderBox color={borderColor} cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase} style={style}>
      {/* Item icon + name packed together, matching the original's fixed 2-row icon + 2-row name layout */}
      <HudBox style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: innerCols * tile,
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

        {/* Item name rendered as font sprites, one explicit line per row, bottom-aligned within the reserved 2-row area */}
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
export type { PauseNamePanelProps };
