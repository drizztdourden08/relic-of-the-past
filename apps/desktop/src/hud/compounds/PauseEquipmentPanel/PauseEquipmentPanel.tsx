/**
 * PauseEquipmentPanel — displays equipped sword, shield, armor + heart pieces/dungeon items.
 *
 * Game layout: tiles (21,21)→(30,29) = 10×9 tiles (inner 8×7)
 * Layout:
 *   Row 0: "ITEM." label text
 *   Row 1-2: Sword(0,1) Shield(3,1) Armor(6,1)  — each 2×2
 *   Row 3: Dashed separator line (8 dots)
 *   Row 4: "EQUIP." label (in dungeon) or blank (overworld)
 *   Row 5-6: Heart pieces (overworld) or Map/Compass/BigKey (dungeon)
 */
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseLabel } from '../../primitives/PauseLabel';
import { PauseEquipSlot } from '../../composites/PauseEquipSlot';

interface PauseEquipmentPanelProps {
  sword: number;
  shield: number;
  armor: number;
  heartPieces: number;
  isInDungeon: boolean;
  bigKeys: number;
  maps: number;
  compasses: number;
  palaceIndex: number;
  scale: number;
  spritesBase: string;
  style?: React.CSSProperties;
}

const PauseEquipmentPanel = ({ sword, shield, armor, heartPieces, isInDungeon, bigKeys, maps, compasses, palaceIndex, scale, spritesBase, style }: PauseEquipmentPanelProps) => {
  const tile = 8 * scale;
  const innerCols = 8;
  const innerRows = 7;

  // Check dungeon item possession for current palace
  const palaceShift = palaceIndex >> 1;
  const hasMap = isInDungeon && !!((maps << palaceShift) & 0x8000);
  const hasCompass = isInDungeon && !!((compasses << palaceShift) & 0x8000);
  const hasBigKey = isInDungeon && !!((bigKeys << palaceShift) & 0x8000);

  return (
    <PauseBorderBox color="yellow" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase} style={style}>
      {/* "EQUIP" label — aligned left */}
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <PauseLabel name="equipment" tiles={5} scale={scale} spritesBase={spritesBase} />
      </div>

      {/* Equipment items: sword(0,1), shield(3,1), armor(6,1) */}
      <div style={{ position: 'absolute', top: tile, left: 0 }}>
        <PauseEquipSlot type="sword" level={sword} scale={scale} spritesBase={spritesBase} />
      </div>
      <div style={{ position: 'absolute', top: tile, left: tile * 3 }}>
        <PauseEquipSlot type="shield" level={shield} scale={scale} spritesBase={spritesBase} />
      </div>
      <div style={{ position: 'absolute', top: tile, left: tile * 6 }}>
        <PauseEquipSlot type="armor" level={armor} scale={scale} spritesBase={spritesBase} />
      </div>

      {/* Dashed separator at row 3 */}
      <div style={{
        position: 'absolute',
        top: tile * 3,
        left: 0,
        width: tile * 8,
        height: tile,
        display: 'flex',
      }}>
        {Array.from({length: 8}, (_, i) => (
          <img
            key={i}
            src={`${spritesBase}font-dot.png`}
            width={tile}
            height={tile}
            draggable={false}
            style={{ display: 'block', imageRendering: 'pixelated' }}
          />
        ))}
      </div>

      {/* Bottom section: heart pieces (overworld) or dungeon items */}
      {!isInDungeon ? (
        <>
          {/* Heart piece indicator at (3,5) */}
          <div style={{ position: 'absolute', top: tile * 5, left: tile * 3 }}>
            <PauseEquipSlot type="heartPiece" level={heartPieces} scale={scale} spritesBase={spritesBase} />
          </div>
        </>
      ) : (
        <>
          {/* "D.ITEMS" label — only in dungeons, at row 4 */}
          <div style={{ position: 'absolute', top: tile * 4, left: 0 }}>
            <PauseLabel name="dungeon-item" tiles={7} scale={scale} spritesBase={spritesBase} />
          </div>
          {/* Dungeon items: map(0,5), compass(3,5), bigkey(6,5) */}
          {hasMap && (
            <div style={{ position: 'absolute', top: tile * 5, left: 0 }}>
              <PauseEquipSlot type="dungeonMap" level={1} scale={scale} spritesBase={spritesBase} />
            </div>
          )}
          {hasCompass && (
            <div style={{ position: 'absolute', top: tile * 5, left: tile * 3 }}>
              <PauseEquipSlot type="compass" level={1} scale={scale} spritesBase={spritesBase} />
            </div>
          )}
          {hasBigKey && (
            <div style={{ position: 'absolute', top: tile * 5, left: tile * 6 }}>
              <PauseEquipSlot type="bigKey" level={1} scale={scale} spritesBase={spritesBase} />
            </div>
          )}
        </>
      )}
    </PauseBorderBox>
  );
};

export { PauseEquipmentPanel };
export type { PauseEquipmentPanelProps };
