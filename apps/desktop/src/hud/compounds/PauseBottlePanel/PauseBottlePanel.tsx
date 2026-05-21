/**
 * PauseBottlePanel — shown when cursor is on the bottle slot.
 * Replaces the progress + equipment panels on the right side.
 * Yellow-bordered panel displaying all 4 bottle slots vertically.
 */
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { getCircleDataUrl } from '../../composites/PauseItemSlot';

/** Bottle content value → sprite filename */
const BOTTLE_SPRITES: Record<number, string> = {
  2: 'hud-bottle',
  3: 'hud-bottle-red',
  4: 'hud-bottle-green',
  5: 'hud-bottle-blue',
  6: 'hud-bottle-fairy',
  7: 'hud-bottle-bee',
  8: 'hud-bottle-good-bee',
};

interface PauseBottlePanelProps {
  bottles: number[];
  selectedIndex: number;
  scale: number;
  spritesBase: string;
  style?: React.CSSProperties;
}

const PauseBottlePanel = ({ bottles, selectedIndex, scale, spritesBase, style }: PauseBottlePanelProps) => {
  const tile = 8 * scale;
  const innerCols = 8;
  const innerRows = 16;
  const itemSize = 2 * tile;
  const circleSize = 4 * tile;

  return (
    <PauseBorderBox color="yellow" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase} style={style}>
      {/* 4 bottles spaced vertically, centered horizontally */}
      {bottles.map((content, i) => {
        const sprite = BOTTLE_SPRITES[content];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: tile * (i * 4 + 1),
              left: tile * 3,
            }}
          >
            {/* Blinking selection circle for active bottle */}
            {i === selectedIndex && (
              <img
                src={getCircleDataUrl()}
                width={circleSize}
                height={circleSize}
                draggable={false}
                style={{
                  position: 'absolute',
                  top: -tile,
                  left: -tile,
                  imageRendering: 'pixelated',
                  pointerEvents: 'none',
                  animation: 'pause-cursor-flash 533ms step-end infinite',
                }}
              />
            )}
            {sprite && (
              <img
                src={`${spritesBase}${sprite}.png`}
                width={itemSize}
                height={itemSize}
                draggable={false}
                style={{ display: 'block', imageRendering: 'pixelated' }}
              />
            )}
          </div>
        );
      })}
    </PauseBorderBox>
  );
};

export { PauseBottlePanel };
export type { PauseBottlePanelProps };
