/* @layer renderer-hud @kind data */
/**
 * PauseItemGrid — the Y-button item grid (5 columns × 4 rows = 20 slots).
 * Enclosed in a green border box with the Y-button indicator.
 *
 * Game layout: tiles (1,5)→(19,19) = 19×15 tiles
 * Inner grid: 5 items × 4 rows, each item is 2×2 tiles with 1-tile gaps.
 */
import { HudBox } from '../../primitives/HudBox';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseItemSlot } from '../../composites/PauseItemSlot';
import { PauseButtonLabel } from '../../composites/PauseButtonLabel';
import { PauseLabel } from '../../primitives/PauseLabel';

interface PauseItemGridProps {
  items: number[];
  selectedIndex: number;
  staticSelection?: boolean;
  scale: number;
  spritesBase: string;
  style?: React.CSSProperties;
}

/**
 * The item grid is 5 columns wide. The game uses a 19×15 tile box.
 * Items are arranged in a 5×4 grid with spacing.
 * Visual order = sequential save-RAM indices 0-19.
 */
const PauseItemGrid = ({ items, selectedIndex, staticSelection, scale, spritesBase, style }: PauseItemGridProps) => {
  const tile = 8 * scale;
  const innerCols = 17;
  const innerRows = 13;

  return (
    <HudBox style={{ position: 'relative', ...style }}>
    <PauseBorderBox color="green" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase}>
      {/* Y-button indicator */}
      <HudBox style={{ position: 'absolute', top: 0, left: 0 }}>
        <PauseButtonLabel button="y" scale={scale} spritesBase={spritesBase} />
      </HudBox>

      {/* Item grid: 5 cols × 4 rows — positioned to match SNES BG3 layout */}
      <HudBox style={{
        display: 'grid',
        gridTemplateColumns: `repeat(5, ${tile * 2}px)`,
        gridTemplateRows: `repeat(4, ${tile * 2}px)`,
        gap: `${tile}px`,
        position: 'absolute',
        top: tile,
        left: tile * 2,
      }}>
        {Array.from({length: 20}, (_, i) => (
          <PauseItemSlot
            key={i}
            saveSlotIndex={i}
            itemValue={items[i] ?? 0}
            selected={i === selectedIndex}
            animate={!staticSelection}
            scale={scale}
            spritesBase={spritesBase}
          />
        ))}
      </HudBox>
    </PauseBorderBox>
    {/* "ITEM" label on top border, col 2 */}
    <HudBox style={{ position: 'absolute', top: 0, left: tile * 2, zIndex: 1, background: 'black' }}>
      <PauseLabel name="item" tiles={2} scale={scale} spritesBase={spritesBase} />
    </HudBox>
    </HudBox>
  );
};

export { PauseItemGrid };
export type { PauseItemGridProps };
