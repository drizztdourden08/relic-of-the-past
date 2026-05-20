/**
 * PauseItemGrid — the Y-button item grid (5 columns × 4 rows = 20 slots).
 * Enclosed in a green border box with the Y-button indicator.
 *
 * Game layout: tiles (1,5)→(19,19) = 19×15 tiles
 * Inner grid: 5 items × 4 rows, each item is 2×2 tiles with 1-tile gaps.
 */
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseItemSlot } from '../../composites/PauseItemSlot';
import { PauseButtonLabel } from '../../composites/PauseButtonLabel';

interface PauseItemGridProps {
  items: number[];
  selectedIndex: number;
  gridToSave: number[];
  scale: number;
  spritesBase: string;
}

/**
 * The item grid is 5 columns wide. The game uses a 19×15 tile box.
 * Items are arranged in a 5×4 grid with spacing.
 * gridToSave maps grid slot → save RAM index for correct display order.
 */
const PauseItemGrid = ({ items, selectedIndex, gridToSave, scale, spritesBase }: PauseItemGridProps) => {
  const tile = 8 * scale;
  const innerCols = 17;
  const innerRows = 13;

  return (
    <PauseBorderBox color="green" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase}>
      {/* Y-button indicator — positioned absolutely, overlaps top border by 1 tile */}
      <div style={{ position: 'absolute', top: -tile, left: 0 }}>
        <PauseButtonLabel button="y" scale={scale} spritesBase={spritesBase} />
      </div>

      {/* Item grid: 5 cols × 4 rows using CSS Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(5, ${tile * 2}px)`,
        gridTemplateRows: `repeat(4, ${tile * 2}px)`,
        gap: `${tile}px`,
        marginTop: tile,
        marginLeft: tile,
      }}>
        {gridToSave.slice(0, 20).map((saveIdx, gridIdx) => (
          <PauseItemSlot
            key={gridIdx}
            saveSlotIndex={saveIdx}
            itemValue={items[saveIdx] ?? 0}
            selected={gridIdx === selectedIndex}
            scale={scale}
            spritesBase={spritesBase}
          />
        ))}
      </div>
    </PauseBorderBox>
  );
};

export { PauseItemGrid };
export type { PauseItemGridProps };
