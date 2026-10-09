/* @layer renderer-hud @kind component */
import { getCircleDataUrl } from '../../../../composites/PauseItemSlot';
import { HudBox } from '../../../../primitives/HudBox';
import { HudImage } from '../../../../primitives/HudImage';
import { HudSprite } from '../../../../primitives/HudSprite';
import { CELL_PITCH, CELL_SIZE } from '../../PauseItemsScreen.constants';
import { CURSOR_INSET, CURSOR_SIZE } from './PauseCellGrid.constants';
import type { PauseCellGridProps } from './PauseCellGrid.type';

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
