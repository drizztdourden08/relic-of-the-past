/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { getCircleDataUrl } from '../../composites/PauseItemSlot';
import { BOTTLE_SPRITES } from './PauseBottlePanel.constants';
import type { PauseBottlePanelProps } from './PauseBottlePanel.type';

const PauseBottlePanel = ({ bottles, selectedIndex, scale, spritesBase, style }: PauseBottlePanelProps) => {
  const tile = 8 * scale;
  const innerCols = 8;
  const innerRows = 16;
  const itemSize = 2 * tile;
  const circleSize = 4 * tile;

  return (
    <PauseBorderBox color="yellow" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase} style={style}>
      {bottles.map((content, i) => {
        const sprite = BOTTLE_SPRITES[content];
        return (
          <HudBox
            key={i}
            style={{
              position: 'absolute',
              top: tile * (i * 4 + 1),
              left: tile * 3,
            }}
          >
            {i === selectedIndex && (
              <HudImage
                src={getCircleDataUrl()}
                width={circleSize}
                height={circleSize}
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
              <HudImage
                src={`${spritesBase}${sprite}.png`}
                width={itemSize}
                height={itemSize}
                style={{ display: 'block', imageRendering: 'pixelated' }}
              />
            )}
          </HudBox>
        );
      })}
    </PauseBorderBox>
  );
};

export { PauseBottlePanel };
