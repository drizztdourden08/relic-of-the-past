/**
 * PauseAbilitiesPanel — displays Link's abilities (lift, dash, swim, etc.)
 * with level indicators.
 *
 * Game layout: tiles (1,21)→(19,29) = 19×9 tiles
 * Abilities are controlled by link_ability_flags:
 *   bit7: Lift (gloves)
 *   bit6: Dash (boots)
 *   bit5: Swim (flippers)
 *   bit4: Talk (book)
 *   bit3: Pull
 *   bit2: Read
 *
 * Equipment shown: boots, gloves, flippers, moon pearl
 */
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseLabel } from '../../primitives/PauseLabel';
import { PauseButtonLabel } from '../../composites/PauseButtonLabel';
import { PauseEquipSlot } from '../../composites/PauseEquipSlot';

interface PauseAbilitiesPanelProps {
  gloves: number;
  boots: number;
  flippers: number;
  moonPearl: number;
  abilityFlags: number;
  scale: number;
  spritesBase: string;
}

const PauseAbilitiesPanel = (props: PauseAbilitiesPanelProps) => {
  const { gloves, boots, flippers, moonPearl, scale, spritesBase } = props;
  const tile = 8 * scale;
  // Box: 17 inner cols × 7 inner rows (+ 2 border = 19×9)
  const innerCols = 17;
  const innerRows = 7;

  return (
    <PauseBorderBox color="red" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase}>
      {/* A-button indicator — overlaps border */}
      <div style={{ position: 'absolute', top: -tile, left: 0 }}>
        <PauseButtonLabel button="a" scale={scale} spritesBase={spritesBase} />
      </div>

      {/* "DO" title (dungeon-item label) */}
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: tile * 2 }}>
        <PauseLabel name="dungeon-item" tiles={2} scale={scale} spritesBase={spritesBase} />
      </div>

      {/* Ability text labels (LIFT, DASH, etc.) — shown when acquired */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${tile * 0.5}px ${tile * 2}px`, marginTop: tile }}>
        {gloves > 0 && <span style={{ color: '#fff', fontSize: tile * 0.9, fontFamily: 'monospace', imageRendering: 'pixelated' }}>LIFT.{gloves}</span>}
        {boots > 0 && <span style={{ color: '#fff', fontSize: tile * 0.9, fontFamily: 'monospace' }}>DASH</span>}
        {flippers > 0 && <span style={{ color: '#fff', fontSize: tile * 0.9, fontFamily: 'monospace' }}>SWIM</span>}
      </div>

      {/* Equipment row at bottom */}
      <div style={{
        display: 'flex',
        gap: `${tile * 2}px`,
        marginTop: 'auto',
      }}>
        <PauseEquipSlot type="boots" level={boots} scale={scale} spritesBase={spritesBase} />
        <PauseEquipSlot type="gloves" level={gloves} scale={scale} spritesBase={spritesBase} />
        <PauseEquipSlot type="flippers" level={flippers} scale={scale} spritesBase={spritesBase} />
        <PauseEquipSlot type="moonPearl" level={moonPearl} scale={scale} spritesBase={spritesBase} />
      </div>
    </PauseBorderBox>
  );
};

export { PauseAbilitiesPanel };
export type { PauseAbilitiesPanelProps };
