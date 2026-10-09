/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseButtonLabel } from '../../composites/PauseButtonLabel';
import { PauseEquipSlot } from '../../composites/PauseEquipSlot';
import { PauseLabel } from '../../primitives/PauseLabel';
import type { PauseAbilitiesPanelProps } from './PauseAbilitiesPanel.type';

const PauseAbilitiesPanel = (props: PauseAbilitiesPanelProps) => {
  const { gloves, boots, flippers, moonPearl, abilityFlags, scale, spritesBase, style } = props;
  const tile = 8 * scale;
  const innerCols = 17;
  const innerRows = 7;

  const abilityGrid: { label: string; bit: number; col: number; row: number }[] = [
    { label: 'LIFT', bit: 7, col: 3, row: 1 },
    { label: 'READ', bit: 6, col: 8, row: 1 },
    { label: 'TALK', bit: 5, col: 13, row: 1 },
    { label: 'PULL', bit: 3, col: 3, row: 3 },
    { label: 'RUN', bit: 2, col: 8, row: 3 },
    { label: 'SWIM', bit: 1, col: 13, row: 3 },
  ];

  const liftLevel = gloves + 1;

  const gridLeft = tile * 2;
  const gridWidth = tile * 14;

  return (
    <HudBox style={{ position: 'relative', ...style }}>
    <PauseBorderBox color="red" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase}>
      <HudBox style={{ position: 'absolute', top: 0, left: 0 }}>
        <PauseButtonLabel button="a" scale={scale} spritesBase={spritesBase} />
      </HudBox>

      <HudBox style={{
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
          <HudBox key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            {(abilityFlags & (1 << bit)) ? (
              <>
                {label.split('').map((ch, i) => (
                  <HudImage
                    key={i}
                    src={`${spritesBase}font-letter-${ch.toLowerCase()}.png`}
                    width={tile}
                    height={tile}
                    style={{ display: 'block', imageRendering: 'pixelated' }}
                  />
                ))}
                {label === 'LIFT' && (
                  <HudImage
                    src={`${spritesBase}font-level-${liftLevel}.png`}
                    width={tile}
                    height={tile}
                    style={{ display: 'block', imageRendering: 'pixelated' }}
                  />
                )}
              </>
            ) : null}
          </HudBox>
        ))}
      </HudBox>

      <HudBox style={{
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
      </HudBox>
    </PauseBorderBox>
    <HudBox style={{ position: 'absolute', top: 0, left: tile * 2, zIndex: 1, background: 'black' }}>
      <PauseLabel name="do" tiles={2} scale={scale} spritesBase={spritesBase} />
    </HudBox>
    </HudBox>
  );
};

export { PauseAbilitiesPanel };
