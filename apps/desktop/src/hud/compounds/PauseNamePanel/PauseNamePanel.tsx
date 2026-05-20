/**
 * PauseNamePanel — shows the selected item's name.
 *
 * Game layout: tiles (21,5)→(30,10) = 10×6 tiles
 * Displays the X-button item name using font sprites,
 * with the item's icon sprite above the text.
 */
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseButtonLabel } from '../../composites/PauseButtonLabel';

interface PauseNamePanelProps {
  itemName: string;
  itemSprite: string | null;
  scale: number;
  spritesBase: string;
}

const PauseNamePanel = ({ itemName, itemSprite, scale, spritesBase }: PauseNamePanelProps) => {
  const tile = 8 * scale;
  // Box: 8 inner cols × 4 inner rows (+ 2 border = 10×6)
  const innerCols = 8;
  const innerRows = 4;

  return (
    <PauseBorderBox color="green" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase}>
      {/* X-button indicator — overlaps border */}
      <div style={{ position: 'absolute', top: -tile, left: 0 }}>
        <PauseButtonLabel button="x" scale={scale} spritesBase={spritesBase} />
      </div>

      {/* Item icon + name */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: innerCols * tile,
        marginTop: Math.round(tile * 0.5),
      }}>
        {/* Item icon (16×16 SNES pixels) */}
        {itemSprite && (
          <img
            src={`${spritesBase}${itemSprite}.png`}
            width={tile * 2}
            height={tile * 2}
            draggable={false}
            style={{ display: 'block', imageRendering: 'pixelated' }}
          />
        )}

        {/* Item name rendered as font sprites */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {itemName.split('').map((char, idx) => {
            if (char === ' ') {
              return <div key={idx} style={{ width: tile, height: tile }} />;
            }
            const code = char.toUpperCase();
            const isLetter = /[A-Z]/.test(code);
            const isDigit = /[0-9]/.test(code);
            if (!isLet