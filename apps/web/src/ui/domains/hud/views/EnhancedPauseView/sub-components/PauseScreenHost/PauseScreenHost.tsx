/* @layer renderer-hud @kind component */
/**
 * PauseScreenHost picks which of the three panels is on.
 *
 * Keeping the switch here instead of in the view is what keeps the view about
 * STORES: it reads the four it needs, hands the resolved models down once, and
 * never mentions a screen by name again. It also means the three screens can be
 * exercised together without a game running, because every value they draw arrives as
 * a prop.
 *
 * NO SCREEN DRAWS THE PORTRAIT ANY MORE. It used to be built here, at a zoom
 * chosen per screen, and centred in a column each screen reserved for it, which made it a
 * picture of the character standing somewhere they are not. It is now one
 * layer in the view, placed at the live player's own screen position
 * (`PauseHeroLayer`), so it belongs to the menu, not to a panel. The
 * columns stay reserved: the name and the hint under them are laid out against
 * that width, and the character usually stands over it anyway, because the
 * camera keeps them near the middle of the screen.
 */
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
      section={section === 'bottles' ? 'bottles' : ('items' as ItemsSection)}
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
