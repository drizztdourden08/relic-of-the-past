/* @layer renderer-hud @kind component */
/**
 * PauseStatusScreen shows everything the save is, on one panel, plus the two ways
 * out of the game.
 *
 * Continue and Save & quit live HERE instead of on a screen of their own
 * because quitting is a status decision, not an inventory one, and a menu that
 * needs a fourth screen for two buttons has one screen too many. They are the
 * only cells on this panel the cursor can land on; the six rows above are a
 * readout.
 *
 * The two rows are ACTIVATED and never assigned. They are the ways out of the
 * game, not a gameplay verb, and a button pressed while the cursor rests on
 * "Save & quit" should either quit or do nothing, and never rebind itself.
 *
 * THIS PANEL IS ENHANCED, so its hearts are the drawn ones. The armour tier
 * tints them here exactly as it does in the Enhanced HUD's own life block. The
 * caption above them is the only label the row has, which is why it opts back
 * into the console's LIFE strip while taking none of the console's heart
 * artwork. Caption and art are two separate questions and this panel answers
 * them differently.
 *
 * Every progress mark draws whether it is held or not. A dungeon item the
 * player has not found is its own sprite flattened to a silhouette, the same
 * rule the item grid follows, so the row's shape never changes under them.
 */
import { HudLife } from '../HudLife';
import { HudMagicBar } from '../HudMagicBar';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { HudBox } from '../../primitives/HudBox';
import { HudSprite } from '../../primitives/HudSprite';
import { PauseCrystalIcon } from '../../composites/PauseCrystalIcon';
import { PauseEquipSlot } from '../../composites/PauseEquipSlot';
import { PausePendantIcon } from '../../composites/PausePendantIcon';
import { PAUSE_FOCUS_COLOR, PauseText } from '../../composites/PauseText';
import { PauseStatusRow } from './sub-components/PauseStatusRow';
import {
  ACTIONS_Y, ACTION_GLYPH, ACTION_LABELS, ACTION_PAD, ACTION_PITCH, ACTION_X,
  CRYSTALS_Y, CRYSTAL_DROP, CRYSTAL_PITCH, DUNGEON_Y, ICON_PITCH, ICON_SIZE,
  LABEL_GLYPH, LIFE_Y, MAGIC_Y, PENDANTS_Y, PIECES_ICON_X, PIECES_X,
  ROW_LABELS, STATUS_BOX_COLS, STATUS_BOX_ROWS,
} from './PauseStatusScreen.constants';
import type { PauseAction, PauseStatusScreenProps } from './PauseStatusScreen.type';

/** Pendant bits, in the order the row draws them. */
const PENDANT_VARIANTS = ['red', 'blue', 'green'] as const;
const CRYSTAL_COUNT = 7;
const MAGIC_ROW_DROP = 1;

const ACTIONS: readonly { id: PauseAction; label: string }[] = [
  { id: 'continue', label: ACTION_LABELS.continue },
  { id: 'save-quit', label: ACTION_LABELS.saveQuit },
];

const PauseStatusScreen = (props: PauseStatusScreenProps) => {
  const {
    healthCurrent, healthCapacity, heartMode, armor = 0, heartPieces, magic, halfMagic,
    pendants, crystals, dungeonItems, cursor, scale, spritesBase, onFocusAction, onConfirm,
  } = props;

  const px = (n: number): number => n * scale;

  return (
    <PauseBorderBox
      color="gray"
      cols={STATUS_BOX_COLS}
      rows={STATUS_BOX_ROWS}
      scale={scale}
      spritesBase={spritesBase}
    >
      <HudBox style={{ position: 'absolute', left: 0, top: px(LIFE_Y) }}>
        <HudLife
          healthCurrent={healthCurrent}
          healthCapacity={healthCapacity}
          heartMode={heartMode}
          armor={armor}
          showCaption
          scale={scale}
          spritesBase={spritesBase}
        />
      </HudBox>

      <HudBox style={{ position: 'absolute', left: px(PIECES_X), top: px(LIFE_Y + LABEL_GLYPH) }}>
        <PauseText text={ROW_LABELS.pieces} scale={scale} size={LABEL_GLYPH} spritesBase={spritesBase} />
      </HudBox>
      <HudBox style={{ position: 'absolute', left: px(PIECES_ICON_X), top: px(LIFE_Y) }}>
        <PauseEquipSlot type="heartPiece" level={heartPieces} scale={scale} spritesBase={spritesBase} />
      </HudBox>

      <PauseStatusRow
        label={ROW_LABELS.magic} top={MAGIC_Y} valueTop={MAGIC_ROW_DROP}
        scale={scale} spritesBase={spritesBase}
      >
        <HudMagicBar value={magic} halfMagic={halfMagic} scale={scale} />
      </PauseStatusRow>

      <PauseStatusRow label={ROW_LABELS.pendants} top={PENDANTS_Y} scale={scale} spritesBase={spritesBase}>
        {PENDANT_VARIANTS.map((variant, bit) => (
          <HudBox key={variant} style={{ width: px(ICON_PITCH) }}>
            <PausePendantIcon
              variant={(pendants & (1 << bit)) ? variant : 'empty'}
              scale={scale}
              spritesBase={spritesBase}
            />
          </HudBox>
        ))}
      </PauseStatusRow>

      <PauseStatusRow
        label={ROW_LABELS.crystals} top={CRYSTALS_Y} valueTop={CRYSTAL_DROP}
        scale={scale} spritesBase={spritesBase}
      >
        {Array.from({ length: CRYSTAL_COUNT }, (_, bit) => (
          <HudBox key={bit} style={{ width: px(CRYSTAL_PITCH) }}>
            <PauseCrystalIcon filled={!!(crystals & (1 << bit))} scale={scale} spritesBase={spritesBase} />
          </HudBox>
        ))}
      </PauseStatusRow>

      <PauseStatusRow label={ROW_LABELS.dungeon} top={DUNGEON_Y} scale={scale} spritesBase={spritesBase}>
        {dungeonItems.map((item) => (
          <HudBox key={item.sprite} style={{ width: px(ICON_PITCH) }}>
            <HudSprite
              src={`${spritesBase}${item.sprite}.png`}
              width={px(ICON_SIZE)}
              height={px(ICON_SIZE)}
              silhouette={!item.owned}
              silhouetteTone="light"
              scale={scale}
            />
          </HudBox>
        ))}
      </PauseStatusRow>

      {ACTIONS.map((action, index) => (
        <HudBox
          key={action.id}
          onClick={() => { onFocusAction(index); onConfirm(); }}
          style={{
            position: 'absolute',
            left: px(ACTION_X + index * ACTION_PITCH),
            top: px(ACTIONS_Y),
            padding: px(ACTION_PAD),
            cursor: 'pointer',
            outline: index === cursor ? `${px(1)}px solid ${PAUSE_FOCUS_COLOR}` : undefined,
          }}
        >
          <PauseText
            text={action.label}
            scale={scale}
            size={ACTION_GLYPH}
            dim={index !== cursor}
            spritesBase={spritesBase}
          />
        </HudBox>
      ))}
    </PauseBorderBox>
  );
};

export { PauseStatusScreen };
