/* @layer renderer-hud @kind component */
import { getCircleDataUrl } from '../../../../composites/PauseItemSlot';
import { HudBox } from '../../../../primitives/HudBox';
import { HudImage } from '../../../../primitives/HudImage';
import { HudSprite } from '../../../../primitives/HudSprite';
import { PAUSE_FOCUS_COLOR, PauseText } from '../../../../composites/PauseText';
import { LABEL_GLYPH, LABEL_W, TIER_PITCH, TIER_SIZE } from '../../PauseGearScreen.constants';
import { CURSOR_INSET, CURSOR_SIZE, EQUIPPED_BORDER } from './PauseGearRow.constants';
import type { PauseGearRowProps } from './PauseGearRow.type';

const PauseGearRow = (props: PauseGearRowProps) => {
  const { label, cells, cursor, scale, spritesBase, onPick } = props;

  const px = (n: number): number => n * scale;

  return (
    <HudBox style={{ position: 'relative', height: px(TIER_SIZE) }}>
      <HudBox style={{ position: 'absolute', left: 0, top: px((TIER_SIZE - LABEL_GLYPH) / 2) }}>
        <PauseText text={label} scale={scale} size={LABEL_GLYPH} spritesBase={spritesBase} />
      </HudBox>

      {cells.map((cell, index) => (
        <HudBox
          key={index}
          onClick={() => onPick(index)}
          style={{
            position: 'absolute',
            left: px(LABEL_W + index * TIER_PITCH),
            top: 0,
            width: px(TIER_SIZE),
            height: px(TIER_SIZE),
            cursor: 'pointer',
            outline: cell.equipped ? `${px(EQUIPPED_BORDER)}px solid ${PAUSE_FOCUS_COLOR}` : undefined,
          }}
        >
          {index === cursor && (
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
              width={px(TIER_SIZE)}
              height={px(TIER_SIZE)}
              silhouette={!cell.owned}
              silhouetteTone="light"
              scale={scale}
            />
          )}
        </HudBox>
      ))}
    </HudBox>
  );
};

export { PauseGearRow };
