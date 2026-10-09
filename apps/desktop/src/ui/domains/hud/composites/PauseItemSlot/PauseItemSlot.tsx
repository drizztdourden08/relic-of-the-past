/* @layer renderer-hud @kind component */
import { useMemo } from 'react';
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { HudSprite } from '../../primitives/HudSprite';
import { getCircleDataUrl } from './behavior/circle-data-url';
import { getSlotSprite } from './behavior/slot-sprite';
import type { PauseItemSlotProps } from './PauseItemSlot.type';

const PauseItemSlot = ({ saveSlotIndex, itemValue, selected, animate = true, scale, spritesBase }: PauseItemSlotProps) => {
  const tile = 8 * scale;
  const size = 2 * tile;
  const circleSize = 4 * tile;
  const circleOffset = -tile;

  const circleUrl = useMemo(() => selected ? getCircleDataUrl() : '', [selected]);
  const sprite = getSlotSprite(saveSlotIndex, itemValue);

  return (
    <HudBox style={{
      width: size,
      height: size,
      position: 'relative',
    }}>
      {selected && (
        <HudImage
          src={circleUrl}
          width={circleSize}
          height={circleSize}
          style={{
            position: 'absolute',
            top: circleOffset,
            left: circleOffset,
            imageRendering: 'pixelated',
            pointerEvents: 'none',
            animation: animate ? 'pause-cursor-flash 533ms step-end infinite' : undefined,
          }}
        />
      )}
      {sprite && (
        <HudSprite
          src={`${spritesBase}${sprite}.png`}
          width={size}
          height={size}
          scale={scale}
          outline={false}
        />
      )}
    </HudBox>
  );
};

export { PauseItemSlot };
