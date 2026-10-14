/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { PauseLabel } from '../../../primitives/PauseLabel';
import { PauseEquipSlot } from '../../../composites/PauseEquipSlot';
import type { EquipFooterProps } from '../PauseEquipmentPanel.type';

const EquipFooter = (props: EquipFooterProps) => {
  const { isInDungeon, heartPieces, hasMap, hasCompass, hasBigKey, scale, spritesBase } = props;
  const tile = 8 * scale;

  if (!isInDungeon) {
    return (
      <HudBox style={{ position: 'absolute', top: tile * 5, left: tile * 3 }}>
        <PauseEquipSlot type="heartPiece" level={heartPieces} scale={scale} spritesBase={spritesBase} />
      </HudBox>
    );
  }

  return (
    <>
      <HudBox style={{ position: 'absolute', top: tile * 4, left: 0 }}>
        <PauseLabel name="dungeon-item" tiles={7} scale={scale} spritesBase={spritesBase} />
      </HudBox>
      {hasMap && (
        <HudBox style={{ position: 'absolute', top: tile * 5, left: 0 }}>
          <PauseEquipSlot type="dungeonMap" level={1} scale={scale} spritesBase={spritesBase} />
        </HudBox>
      )}
      {hasCompass && (
        <HudBox style={{ position: 'absolute', top: tile * 5, left: tile * 3 }}>
          <PauseEquipSlot type="compass" level={1} scale={scale} spritesBase={spritesBase} />
        </HudBox>
      )}
      {hasBigKey && (
        <HudBox style={{ position: 'absolute', top: tile * 5, left: tile * 6 }}>
          <PauseEquipSlot type="bigKey" level={1} scale={scale} spritesBase={spritesBase} />
        </HudBox>
      )}
    </>
  );
};

export { EquipFooter };
