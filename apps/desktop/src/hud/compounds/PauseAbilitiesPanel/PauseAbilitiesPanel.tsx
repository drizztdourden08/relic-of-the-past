/**
 * PauseAbilitiesPanel — displays Link's abilities and equipment.
 *
 * Game layout: tiles (1,21)→(19,29) = 19×9 tiles (inner 17×7)
 * Abilities drawn via link_ability_flags in a 3×2 grid:
 *   Row 1 (y=22): bit7=LIFT, bit6=READ, bit5=TALK
 *   Row 2 (y=24): bit3=PULL, bit2=RUN,  bit1=SWIM
 *   (bit4 is skipped in the original loop)
 *
 * Gloves override: if link_item_gloves > 0, LIFT text shows "LIFT.1" or "LIFT.2"
 *
 * Equipment sprites at bottom row (y=27):
 *   col 4=boots, col 8=gloves, col 12=flippers, col 16=moon pearl
 */
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseButtonLabel } from '../../composites/PauseButtonLabel';
import { PauseEquipSlot } from '../../composites/PauseEquipSlot';
import { PauseLabel } from '../../primitives/PauseLabel';

interface PauseAbilitiesPanelProps {
  gloves: number;
  boots: number;
  flippers: number;
  moonPearl: number;
  abilityFlags: number;
  scale: number;
  spritesBase: string;
  style?: React.CSSProperties;
}

const PauseAbilitiesPanel = (props: PauseAbilitiesPanelProps) => {
  const { gloves, boots, flippers, moonPearl, abilityFlags, scale, spritesBase, style } = props;
  const tile = 8 * scale;
  const innerCols = 17;
  const innerRows = 7;

  // SNES ability text grid: 3 columns × 2 rows
  // Row 1 (bits 7,6,5): LIFT, READ, TALK at tile positions (3,1), (8,1), (13,1)
  // Row 2 (bits 3,2,1): PULL, RUN,  SWIM at tile positions (3,3), (8,3), (13,3)
  // Note: bit 4 is skipped (outer loop shift in original code)
  const abilityGrid: { label: string; bit: number; col: number; row: number }[] = [
    { label: 'LIFT', bit: 7, col: 3, row: 1 },
    { label: 'READ', bit: 6, col: 8, row: 1 },
    { label: 'TALK', bit: 5, col: 13, row: 1 },
    { label: 'PULL', bit: 3, col: 3, row: 3 },
    { label: 'RUN', bit: 2, col: 8, row: 3 },
    { label: 'SWIM', bit: 1, col: 13, row: 3 },
  ];

  // Gloves level determines the .N suffix on LIFT (0/none=.1, 1=Power Glove=.2, 2=Titan's Mitts=.3)
  const liftLevel = gloves + 1;

  // Both containers align with the item grid above: starts at col 2, width = 14 tiles
  const gridLeft = tile * 2;
  const gridWidth = tile * 14;

  return (
    <div style={{ position: 'relative', ...style }}>
    <PauseBorderBox color="red" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase}>
      {/* A-button indicator */}
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <PauseButtonLabel button="a" scale={scale} spritesBase={spritesBase} />
      </div>

      {/* Abilities grid: 3 cols × 2 rows with equal spacing */}
      <div style={{
        position: 'absolute',
        top: tile * 2 / 3,
        left: gridLeft,
        width: tile * 16.7,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        height: tile * 4,
      }}>
        {abilityGrid.map(({ label, bit }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            {(abilityFlags & (1 << bit)) ? (
              <>
                {label.split('').map((ch, i) => (
                  <img
                    key={i}
                    src={`${spritesBase}font-letter-${ch.toLowerCase()}.png`}
                    width={tile}
                    height={tile}
                    draggable={false}
                    style={{ display: 'block', imageRendering: 'pixelated' }}
                  />
                ))}
                {label === 'LIFT' && (
                  <img
                    src={`${spritesBase}font-level-${liftLevel}.png`}
                    width={tile}
                    height={tile}
                    draggable={false}
                    style={{ display: 'block', imageRendering: 'pixelated' }}
                  />
                )}
              </>
            ) : null}
          </div>
        ))}
      </div>

      {/* Equipment items: flex with equal spacing, aligned with item grid */}
      <div style={{
        position: 'absolute',
        top: tile * 5,
        left: gridLeft,
        width: gridWidth,
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <PauseEquipSlot type="boots" level={boots} scale={scale} spritesBase={spritesBase} />
        <PauseEquipSlot type="gloves" level={gloves} scale={scale} spritesBase={spritesBase} />
        <PauseEquipSlot type="flippers" level={flippers} scale={scale} spritesBase={spritesBase} />
        <PauseEquipSlot type="moonPearl" level={moonPearl} scale={scale} spritesBase={spritesBase} />
      </div>
    </PauseBorderBox>
    {/* "DO" label on top border, col 2 */}
    <div style={{ position: 'absolute', top: 0, left: tile * 2, zIndex: 1, background: 'black' }}>
      <PauseLabel name="do" tiles={2} scale={scale} spritesBase={spritesBase} />
    </div>
    </div>
  );
};

export { PauseAbilitiesPanel };
export type { PauseAbilitiesPanelProps };
