/* @layer renderer-hud @kind component */
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { HudBox } from '../../primitives/HudBox';
import { PauseText } from '../../composites/PauseText';
import { PauseGearRow } from './sub-components/PauseGearRow';
import {
  GEAR_BOX_COLS, HERO_COLUMN_W, HERO_X, HERO_Y, HINT_GLYPH, PASSIVE_SECTION, ROW_PITCH,
} from './PauseGearScreen.constants';
import { gearBoxRows } from './behavior/gear-box-rows';
import { hintY } from './behavior/hint-y';
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
    <HudBox style={{ position: 'relative' }}>
      <PauseBorderBox
        color="yellow"
        cols={GEAR_BOX_COLS}
        rows={gearBoxRows(rowCount)}
        scale={scale}
        spritesBase={spritesBase}
        style={{ position: 'absolute', left: 0, top: 0 }}
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

      <HudBox style={{
        position: 'absolute',
        left: px(HERO_X),
        top: px(HERO_Y),
        width: px(HERO_COLUMN_W),
        display: 'flex',
        justifyContent: 'center',
      }}>
        {hero}
      </HudBox>

      <HudBox style={{
        position: 'absolute',
        left: px(HERO_X),
        top: px(hintY(rowCount)),
        width: px(HERO_COLUMN_W),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {hintLines.map((line, index) => (
          <PauseText key={index} text={line} scale={scale} size={HINT_GLYPH} dim spritesBase={spritesBase} />
        ))}
      </HudBox>
    </HudBox>
  );
};

export { PauseGearScreen };
