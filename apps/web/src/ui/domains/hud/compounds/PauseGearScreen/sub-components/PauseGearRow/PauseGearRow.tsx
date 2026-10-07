/* @layer renderer-hud @kind component */
/**
 * PauseGearRow draws one labelled ladder: a name, then its tiers left to right.
 *
 * All four rows of the gear screen are this component. The three upgrade
 * ladders and the passive row differ only in what a cell MEANS (a tier you
 * can drop to, or a thing you either hold or do not), and both answer the same
 * two questions the row draws: is it owned, and is it the one in force. Giving
 * them one shape is what keeps the cursor's left/right walk identical on every
 * row.
 *
 * A tier above the high-water mark draws as a silhouette, exactly as an
 * unowned item cell does: the ladder's full length is visible from the start,
 * so the player can see there is somewhere further to go without being told
 * what is waiting there.
 */
import { getCircleDataUrl } from '../../../../composites/PauseItemSlot';
import { HudBox } from '../../../../primitives/HudBox';
import { HudImage } from '../../../../primitives/HudImage';
import { HudSprite } from '../../../../primitives/HudSprite';
import { PAUSE_FOCUS_COLOR, PauseText } from '../../../../composites/PauseText';
import { LABEL_GLYPH, LABEL_W, TIER_PITCH, TIER_SIZE } from '../../PauseGearScreen.constants';
import type { PauseGearRowProps } from './PauseGearRow.type';

/** The cursor ring clears the 16-pixel cell by one tile on every side. */
const CURSOR_SIZE = 32;
const CURSOR_INSET = -8;
/** The worn tier keeps a steady one-pixel frame, so it reads apart from the cursor. */
const EQUIPPED_BORDER = 1;

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
