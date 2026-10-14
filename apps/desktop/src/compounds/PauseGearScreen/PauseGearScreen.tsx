/* @layer renderer-hud @kind component */
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { HudBox } from '../../primitives/HudBox';
import { PauseGearRow } from './sub-components/PauseGearRow';
import { GearSideColumns } from './sub-components/GearSideColumns';
import { GEAR_BOX_COLS, PASSIVE_SECTION, ROW_PITCH } from './PauseGearScreen.constants';
import { gearBoxRows } from './behavior/gear-box-rows';
import type { GearSection, PauseGearScreenProps } from './PauseGearScreen.type';

const PauseGearScreen = (props: PauseGearScreenProps) => {
  const {
    ladders, passives, passiveLabel, section, cursor, hintLines, hero,
    scale, spritesBase, onFocusTier, onConfirm,
  } = props;

  const px = (n: number): number => n * scale;
  const rowCount = ladders.length + 1;

  const pick = (row: GearSection, index: number): void => {
    onFocusTier(row, index);
    onConfirm();
  };

  return (
    <HudBox layout="relative">
      <PauseBorderBox
        color="yellow"
        cols={GEAR_BOX_COLS}
        rows={gearBoxRows(rowCount)}
        scale={scale}
        spritesBase={spritesBase}
        atOrigin
      >
        {ladders.map((ladder, row) => (
          <HudBox key={ladder.kind} style={{ position: 'absolute', left: 0, top: px(row * ROW_PITCH) }}>
            <PauseGearRow
              label={ladder.label}
              cells={ladder.cells}
              cursor={section === ladder.section ? cursor : -1}
              scale={scale}
              spritesBase={spritesBase}
              onPick={(index) => pick(ladder.section, index)}
            />
          </HudBox>
        ))}

        <HudBox style={{ position: 'absolute', left: 0, top: px(ladders.length * ROW_PITCH) }}>
          <PauseGearRow
            label={passiveLabel}
            cells={passives}
            cursor={section === PASSIVE_SECTION ? cursor : -1}
            scale={scale}
            spritesBase={spritesBase}
            onPick={(index) => pick(PASSIVE_SECTION, index)}
          />
        </HudBox>
      </PauseBorderBox>

      <GearSideColumns hintLines={hintLines} hero={hero} rowCount={rowCount} scale={scale} spritesBase={spritesBase} />
    </HudBox>
  );
};

export { PauseGearScreen };
