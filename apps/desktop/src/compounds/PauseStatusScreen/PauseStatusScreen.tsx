/* @layer renderer-hud @kind component */
import { HudMagicBar } from '../HudMagicBar';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseStatusRow } from './sub-components/PauseStatusRow';
import { StatusActions } from './sub-components/StatusActions';
import { StatusIconRows } from './sub-components/StatusIconRows';
import { StatusLife } from './sub-components/StatusLife';
import { MAGIC_ROW_DROP, MAGIC_Y, ROW_LABELS, STATUS_BOX_COLS, STATUS_BOX_ROWS } from './PauseStatusScreen.constants';
import type { PauseStatusScreenProps } from './PauseStatusScreen.type';

const PauseStatusScreen = (props: PauseStatusScreenProps) => {
  const {
    healthCurrent, healthCapacity, heartMode, armor = 0, heartPieces, magic, halfMagic,
    pendants, crystals, dungeonItems, cursor, scale, spritesBase, onFocusAction, onConfirm,
  } = props;

  return (
    <PauseBorderBox
      color="gray"
      cols={STATUS_BOX_COLS}
      rows={STATUS_BOX_ROWS}
      scale={scale}
      spritesBase={spritesBase}
    >
      <StatusLife
        healthCurrent={healthCurrent}
        healthCapacity={healthCapacity}
        heartMode={heartMode}
        armor={armor}
        heartPieces={heartPieces}
        scale={scale}
        spritesBase={spritesBase}
      />

      <PauseStatusRow
        label={ROW_LABELS.magic} top={MAGIC_Y} valueTop={MAGIC_ROW_DROP}
        scale={scale} spritesBase={spritesBase}
      >
        <HudMagicBar value={magic} halfMagic={halfMagic} scale={scale} />
      </PauseStatusRow>

      <StatusIconRows
        pendants={pendants}
        crystals={crystals}
        dungeonItems={dungeonItems}
        scale={scale}
        spritesBase={spritesBase}
      />

      <StatusActions
        cursor={cursor}
        scale={scale}
        spritesBase={spritesBase}
        onFocusAction={onFocusAction}
        onConfirm={onConfirm}
      />
    </PauseBorderBox>
  );
};

export { PauseStatusScreen };
