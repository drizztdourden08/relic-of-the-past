/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseLabel } from '../../primitives/PauseLabel';
import { PauseEquipSlot } from '../../composites/PauseEquipSlot';
import type { PauseEquipmentPanelProps } from './PauseEquipmentPanel.type';

const PauseEquipmentPanel = ({ sword, shield, armor, heartPieces, isInDungeon, bigKeys, maps, compasses, palaceIndex, scale, spritesBase, style }: PauseEquipmentPanelProps) => {
  const tile = 8 * scale;
  const innerCols = 8;
  const innerRows = 7;

  const palaceShift = palaceIndex >> 1;
  const hasMap = isInDungeon && !!((maps << palaceShift) & 0x8000);
  const hasCompass = isInDungeon && !!((compasses << palaceShift) & 0x8000);
  const hasBigKey = isInDungeon && !!((bigKeys << palaceShift) & 0x8000);

  return (
    <PauseBorderBox color="yellow" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase} style={style}>
      <HudBox style={{ position: 'absolute', top: 0, left: 0 }}>
        <PauseLabel name="equipment" tiles={5} scale={scale} spritesBase={spritesBase} />
      </HudBox>

      <HudBox style={{ position: 'absolute', top: tile, left: 0 }}>
        <PauseEquipSlot type="sword" level={sword} scale={scale} spritesBase={spritesBase} />
      </HudBox>
      <HudBox style={{ position: 'absolute', top: tile, left: tile * 3 }}>
        <PauseEquipSlot type="shield" level={shield} scale={scale} spritesBase={spritesBase} />
      </HudBox>
      <HudBox style={{ position: 'absolute', top: tile, left: tile * 6 }}>
        <PauseEquipSlot type="armor" level={armor} scale={scale} spritesBase={spritesBase} />
      </HudBox>

      <HudBox style={{
        position: 'absolute',
        top: tile * 3,
        left: 0,
        width: tile * 8,
        height: tile,
        display: 'flex',
      }}>
        {Array.from({length: 8}, (_, i) => (
          <HudImage
            key={i}
            src={`${spritesBase}font-dot.png`}
            width={tile}
            height={tile}
            style={{ display: 'block', imageRendering: 'pixelated' }}
          />
        ))}
      </HudBox>

      {!isInDungeon ? (
        <>
          <HudBox style={{ position: 'absolute', top: tile * 5, left: tile * 3 }}>
            <PauseEquipSlot type="heartPiece" level={heartPieces} scale={scale} spritesBase={spritesBase} />
          </HudBox>
        </>
      ) : (
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
      )}
    </PauseBorderBox>
  );
};

export { PauseEquipmentPanel };
