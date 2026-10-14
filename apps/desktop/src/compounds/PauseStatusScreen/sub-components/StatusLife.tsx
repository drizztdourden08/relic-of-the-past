/* @layer renderer-hud @kind component */
import { HudLife } from '../../HudLife';
import { HudBox } from '../../../primitives/HudBox';
import { PauseEquipSlot } from '../../../composites/PauseEquipSlot';
import { PauseText } from '../../../composites/PauseText';
import { LABEL_GLYPH, LIFE_Y, PIECES_ICON_X, PIECES_X, ROW_LABELS } from '../PauseStatusScreen.constants';
import type { StatusLifeProps } from '../PauseStatusScreen.type';

const StatusLife = (props: StatusLifeProps) => {
  const { healthCurrent, healthCapacity, heartMode, armor, heartPieces, scale, spritesBase } = props;
  const px = (n: number): number => n * scale;

  return (
    <>
      <HudBox style={{ position: 'absolute', left: 0, top: px(LIFE_Y) }}>
        <HudLife
          healthCurrent={healthCurrent}
          healthCapacity={healthCapacity}
          heartMode={heartMode}
          armor={armor}
          showCaption
          scale={scale}
          spritesBase={spritesBase}
        />
      </HudBox>

      <HudBox style={{ position: 'absolute', left: px(PIECES_X), top: px(LIFE_Y + LABEL_GLYPH) }}>
        <PauseText text={ROW_LABELS.pieces} scale={scale} size={LABEL_GLYPH} spritesBase={spritesBase} />
      </HudBox>
      <HudBox style={{ position: 'absolute', left: px(PIECES_ICON_X), top: px(LIFE_Y) }}>
        <PauseEquipSlot type="heartPiece" level={heartPieces} scale={scale} spritesBase={spritesBase} />
      </HudBox>
    </>
  );
};

export { StatusLife };
