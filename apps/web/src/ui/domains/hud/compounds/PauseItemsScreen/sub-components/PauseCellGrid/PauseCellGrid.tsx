/* @layer renderer-hud @kind component */
/**
 * PauseCellGrid draws a run of inventory cells on the menu's 24-pixel pitch.
 *
 * The item grid and the bottle row are the same thing at different widths, so
 * they are the same component: six columns for one, four for the other. That
 * matters beyond saving a file, because the cursor walks out of the bottom of the item
 * grid straight into the bottles, and two separately-built grids would drift
 * apart on the pitch that makes that read as one movement.
 *
 * AN UNOWNED CELL STILL DRAWS. It carries its tier-one sprite as a silhouette,
 * never an empty hole, so the grid's geography is identical from the first
 * pause to the last: the player learns where a thing lives before they own it,
 * and the outline never says which upgrade tier is still out in the world.
 */
import { getCircleDataUrl } from '../../../../composites/PauseItemSlot';
import { HudBox } from '../../../../primitives/HudBox';
import { HudImage } from '../../../../primitives/HudImage';
import { HudSprite } from '../../../../primitives/HudSprite';
import { CELL_PITCH, CELL_SIZE } from '../../PauseItemsScreen.constants';
import type { PauseCellGridProps } from './PauseCellGrid.type';

/** The cursor ring is 4 tiles wide, one tile clear of the icon on every side. */
const CURSOR_SIZE = 32;
const CURSOR_INSET = -8;

const PauseCellGrid = (props: PauseCellGridProps) => {
  const { cells, columns, cursor, showCursor, scale, spritesBase, onPick } = props;

  const px = (n: number): number => n * scale;
  const rows = Math.max(1, Math.ceil(cells.length / columns));

  return (
    <HudBox style={{
      position: 'relative',
      width: px((columns - 1) * CELL_PITCH + CELL_SIZE),
      height: px((rows - 1) * CELL_PITCH + CELL_SIZE),
    }}>
      {cells.map((cell, index) => {
        const selected = showCursor && index === cursor;
        return (
          <HudBox
            key={cell.hudItem}
            onClick={() => onPick(index)}
            style={{
              position: 'absolute',
              left: px((index % columns) * CELL_PITCH),
              top: px(Math.floor(index / columns) * CELL_PITCH),
              width: px(CELL_SIZE),
              height: px(CELL_SIZE),
              cursor: 'pointer',
            }}
          >
            {selected && (
              <HudImage
                src={getCircleDataUrl()}
                width={px(CURSOR_SIZE)}
                height={px(CURSOR_SIZE)}
                style={{
                  position: 'absolute',
                  left: px(CURSOR_INSET),
                  top: px(CURSOR_INSET),
                  imageRendering: 'pixelated',
                  pointerEvents: 'none',
                  animation: 'pause-cursor-flash 533ms step-end infinite',
                }}
              />
            )}
            {cell.sprite && (
              <HudSprite
                src={`${spritesBase}${cell.sprite}.png`}
                width={px(CELL_SIZE)}
                height={px(CELL_SIZE)}
                silhouette={!cell.owned}
                silhouetteTone="light"
                scale={scale}
              />
            )}
          </HudBox>
        );
      })}
    </HudBox>
  );
};

export { PauseCellGrid };
