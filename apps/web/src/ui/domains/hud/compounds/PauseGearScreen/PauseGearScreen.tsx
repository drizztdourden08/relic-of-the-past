/* @layer renderer-hud @kind component */
/**
 * PauseGearScreen draws the equipment ladders and the passive row, with the hero
 * standing beside them at three times native.
 *
 * HOW MANY LADDERS is the caller's answer, not this component's: it draws one
 * row per entry of `ladders`, puts the passives under the last of them, and
 * sizes its own box from that count. Three of them are upgrade ladders; the
 * fourth is the arrow row, whose rungs are the two projectile types instead of
 * a rank, and which therefore has no "nothing worn" rung at all. Nothing here
 * has to know which is which. A row draws owned, worn and cursor, and what a
 * press on one MEANS is decided where every other press is decided.
 *
 * The ladders are SELECTABLE, which the console's own menu never allowed: a
 * tier at or below the highest ever held can be worn again, so a player can
 * drop to a weaker blade for a challenge run and climb back. What makes that
 * safe is the high-water mark the view supplies. Ownership is never read off
 * the live equipment, which only says what is worn right now.
 *
 * The passive row is a readout, not a ladder. Nothing there can be chosen, so
 * a cell only ever says held or not held, and the cursor walks it the same way
 * it walks the ladders so there is no dead region on the screen. Having no tier
 * to equip is exactly what makes it the row that assigns the ACTION verb: a
 * press there can only mean one thing.
 *
 * Every cell of every row reports a click the same way (move the cursor here,
 * then confirm), and what that confirms is not this screen's business. It used
 * to be: this component checked ownership itself and called the write, which is
 * how the mouse ended up with a path the pad did not have.
 */
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { HudBox } from '../../primitives/HudBox';
import { PauseText } from '../../composites/PauseText';
import { PauseGearRow } from './sub-components/PauseGearRow';
import {
  GEAR_BOX_COLS, HERO_COLUMN_W, HERO_X, HERO_Y, HINT_GLYPH, ROW_PITCH, gearBoxRows, hintY,
} from './PauseGearScreen.constants';
import type { GearSection, PauseGearScreenProps } from './PauseGearScreen.type';

const PASSIVE_SECTION = 'passive' as const;

const PauseGearScreen = (props: PauseGearScreenProps) => {
  const {
    ladders, passives, passiveLabel, section, cursor, hintLines, hero,
    scale, spritesBase, onFocusTier, onConfirm,
  } = props;

  const px = (n: number): number => n * scale;
  /** Every ladder, then the passives. The box and the hint follow this count. */
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
