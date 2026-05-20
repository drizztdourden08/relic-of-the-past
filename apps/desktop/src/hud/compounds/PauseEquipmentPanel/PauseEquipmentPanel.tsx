/**
 * PauseEquipmentPanel — displays equipped sword, shield, armor.
 *
 * Game layout: tiles (21,21)→(30,29) = 10×9 tiles
 * Shows sword/shield/armor with level-appropriate sprites.
 */
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseLabel } from '../../primitives/PauseLabel';
import { PauseEquipSlot } from '../../composites/PauseEquipSlot';

interface PauseEquipmentPanelProps {
  sword: number;
  shield: number;
  armor: number;
  scale: number;
  spritesBase: string;
}

const PauseEquipmentPanel = ({ sword, shield, armor, scale, spritesBase }: PauseEquipmentPanelProps) => {
  const tile = 8 * scale;
  // Box: 8 inner cols × 7 inner rows (+ 2 border = 10×9)
  const innerCols = 8;
  const innerRows = 7;

  return (
    <PauseBorderBox color="yellow" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase}>
      {/* ITEM label (title for equipment section) */}
      <PauseLabel name="equipment" tiles={5} scale={scale} spritesBase={spritesBase} />

      {/* Equipment items arranged horizontally */}
      <div style={{
        display: 'flex',
        gap: `${tile}px`,
        alignItems: 'center',
        marginTop: tile * 2,
        marginLeft: tile,
      }}>
        <PauseEquipSlot type="sword" level={sword} scale={scale} spritesBase={spritesBase} />
        <PauseEquipSlot type="shield" level={shield} scale={scale} spritesBase={spritesBase} />
        <PauseEquipSlot type="armor" level={armor} scale={scale} spritesBase={spritesBase} />
      </div>
    </PauseBorderBox>
  );
};

export { PauseEquipmentPanel };
export type { PauseEquipmentPanelProps };
