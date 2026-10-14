/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseItemSlot } from '../../composites/PauseItemSlot';
import { PauseButtonLabel } from '../../composites/PauseButtonLabel';
import { PauseLabel } from '../../primitives/PauseLabel';
import type { PauseItemGridProps } from './PauseItemGrid.type';

const PauseItemGrid = ({ items, selectedIndex, staticSelection, scale, spritesBase, className }: PauseItemGridProps) => {
  const tile = 8 * scale;
  const innerCols = 17;
  const innerRows = 13;

  return (
    <HudBox layout="relative" className={className}>
    <PauseBorderBox color="green" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase}>
      <HudBox layout="at-origin">
        <PauseButtonLabel button="y" scale={scale} spritesBase={spritesBase} />
      </HudBox>

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
    <HudBox style={{ position: 'absolute', top: 0, left: tile * 2, zIndex: 1, background: 'black' }}>
      <PauseLabel name="item" tiles={2} scale={scale} spritesBase={spritesBase} />
    </HudBox>
    </HudBox>
  );
};

export { PauseItemGrid };
