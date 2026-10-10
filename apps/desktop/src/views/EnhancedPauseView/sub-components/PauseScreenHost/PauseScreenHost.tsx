/* @layer renderer-hud @kind component */
import { PauseGearScreen } from '../../../../compounds/PauseGearScreen';
import { PauseItemsScreen } from '../../../../compounds/PauseItemsScreen';
import { PauseStatusScreen } from '../../../../compounds/PauseStatusScreen';
import { GEAR_LABELS } from '../../EnhancedPauseView.constants';
import type { GearSection } from '../../../../compounds/PauseGearScreen';
import type { ItemsSection } from '../../../../compounds/PauseItemsScreen';
import type { PauseScreenHostProps } from './PauseScreenHost.type';

const PauseScreenHost = (props: PauseScreenHostProps) => {
  const {
    screen, section, cursor, items, gear, dungeonItems, vitals, heartMode,
    hintLines, scale, spritesBase, onFocus, onConfirm,
  } = props;

  if (screen === 'gear') {
    return (
      <PauseGearScreen
        ladders={gear.ladders}
        passives={gear.passives}
        passiveLabel={GEAR_LABELS.passive}
        section={section as GearSection}
        cursor={cursor}
        hintLines={hintLines}
        hero={null}
        scale={scale}
        spritesBase={spritesBase}
        onFocusTier={(next, at) => onFocus('gear', next, at)}
        onConfirm={onConfirm}
      />
    );
  }

  if (screen === 'status') {
    return (
      <PauseStatusScreen
        healthCurrent={vitals.healthCurrent}
        healthCapacity={vitals.healthCapacity}
      armor={vitals.armor}
        heartMode={heartMode}
        heartPieces={vitals.heartPieces}
        magic={vitals.magic}
        halfMagic={vitals.halfMagic}
        pendants={vitals.pendants}
        crystals={vitals.crystals}
        dungeonItems={dungeonItems}
        cursor={cursor}
        scale={scale}
        spritesBase={spritesBase}
        onFocusAction={(at) => onFocus('status', 'actions', at)}
        onConfirm={onConfirm}
      />
    );
  }

  return (
    <PauseItemsScreen
      items={items.items}
      bottles={items.bottles}
      section={section === 'bottles' ? 'bottles' : ('items')}
      cursor={cursor}
      nameLines={items.nameLines}
      hintLines={hintLines}
      hero={null}
      scale={scale}
      spritesBase={spritesBase}
      onFocusCell={(next, at) => onFocus('items', next, at)}
    />
  );
};

export { PauseScreenHost };
