/* @layer renderer-components @kind component */
/**
 * The body of the selected options tab. Each tab keeps the panel's own order:
 * the live sections the player may change first, still under their catalog
 * headings, then the block that tab exists for, then the subject's own fixed
 * rows. An unbuilt tab is one line and whatever locked rows the catalog files
 * under it.
 *
 * The capacity families and the wishing pond share the same physical slots,
 * so those two tabs render the pair the RULE allows instead of the raw
 * choices: an edit on either side re-points the other. The pond tab opens
 * with that pair read back as plain sentences, derived on every render.
 *
 * The world tab closes on the dark-room section, and its light tiles read
 * through the world-item scope switch. The items tab reads its item-power rows
 * through the blade ticks above them: a row the ticks have decided is shown
 * on and inert with the reason on it, the stored answer untouched.
 */
import { CapacityUpgradesSection } from '@domains/app/views/Randomizer/sub-components/CapacityUpgradesSection';
import { ShopPricesBlock } from '@domains/app/compounds/ShopPricesBlock';
import { ShopSlotsBlock } from '@domains/app/compounds/ShopSlotsBlock';
import { DifficultyBlock } from '@domains/app/compounds/DifficultyBlock';
import { ProgressiveTiersBlock } from '@domains/app/compounds/ProgressiveTiersBlock';
import { RetroBowBlock } from '@domains/app/compounds/RetroBowBlock';
import { PondStatusNote } from '@domains/app/compounds/PondStatusNote';
import { WishingPondSection } from '@domains/app/views/Randomizer/sub-components/WishingPondSection';
import { DarkRoomsSection } from '@domains/app/views/Randomizer/sub-components/DarkRoomsSection';
import { REFERENCE_CAPACITY_PROFILE, holdWalletToFloor, walletFloorOf } from '@shared/randomizer/ap-world/capacity';
import { pondStatusOf } from '@shared/randomizer/ap-world/capacity-pond';
import { holdPondToWallet, pondWalletTopOf } from '@shared/randomizer/ap-world/pond/pond-wallet-top';
import { applyRowChange } from '@app/hooks/randomizer/capacity-row-state';
import { capacityPondStateOf, withCapacityPondRule } from '@app/hooks/randomizer/capacity-pond-choices';
import { FROZEN_POND_KEYS, NO_FROZEN_KEYS, pondGroupsFor } from '@app/hooks/randomizer/pond-mode-rows';
import { CAPACITY_POND, POND_IDS } from '@shared/randomizer/ap-world/pond/pond-instances.data';
import { effectivePondProfiles } from '@shared/randomizer/ap-world/pond/pond-share';
import type { PondId } from '@shared/randomizer/ap-world/pond/pond-instance.type';
import type { PondSetting } from '@shared/randomizer/ap-world/pond/pond-profile.type';
import type { PondProfiles } from '@shared/randomizer/ap-world/pond/pond-profiles.type';
import { darkRoomSettingOfChoices, withDarkRoomSetting } from '@app/hooks/randomizer/dark-room-choices';
import { forcedItemPowerRows } from '@app/hooks/randomizer/item-power-rows';
import { DARK_ROOM_REQUIRED_KEY, forcedDarkRoomLightReasons } from '@shared/randomizer/ap-world/dark-rooms';
import { OptionGroupList } from './OptionGroupList';
import { SubjectFixedRows } from './SubjectFixedRows';
import { UpcomingTabBody } from './UpcomingTabBody';
import { UPCOMING_TITLE, isUpcomingTab } from './option-tab-copy';
import type { ApOptionDef } from '@shared/randomizer/ap-world/options.type';
import type { OptionTabBodyProps } from './OptionTabBody.type';

/** The master switch is off, so the pond bound to the capacity families is not the player's to set. */
const FROZEN_PONDS: readonly PondId[] = ['capacity'];

/**
 * The three ponds after an edit on one of them. While the share switch is on
 * every pond READS the capacity pond's rows (pond-share.ts), so whichever tab
 * the edit came from writes there and the other two keep the rows they hold,
 * which is what gives them back when the switch goes off again.
 */
const pondsWithEdit = (
  profiles: PondProfiles, id: PondId, next: PondSetting, share: boolean,
): PondProfiles => ({ ...profiles, [share ? CAPACITY_POND.id : id]: next });

const OptionTabBody = (props: OptionTabBodyProps) => {
  const {
    tab, groups, lockedGroups, values, valueOf, cellOf,
    choices, seed, pondDemands, notes, fillerHeadroom, onRowChange, onChange,
  } = props;

  const rule = capacityPondStateOf(choices);
  // What these settings let the seed charge at once, and the families with the
  // wallet's final cap already standing on that floor. Every ceiling below
  // reads the held profile, so a shot cost, a shelf price, a throw and the
  // wallet row can never disagree about what the wallet holds.
  const walletFloor = walletFloorOf(values);
  const capacity = holdWalletToFloor(rule.capacity, walletFloor);
  // The capacity pond as the seed will read it: held to what the wallet family
  // can hold. The rule settles that pond, so the settled one is what is shown.
  const heldPond = holdPondToWallet(rule.pond, pondWalletTopOf(capacity)).setting;
  const pondShare = choices.pondShare === true;
  // What the three blocks HOLD, and what the tabs show: the shared switch is
  // resolved by the model's own reader, never a second time here.
  const pondProfiles = { ...choices.ponds, capacity: rule.pond };
  const shownPonds = effectivePondProfiles(pondProfiles, pondShare);
  // Sharing sends every edit to the capacity pond, so a frozen capacity pond
  // freezes all three: a live control that cannot change the seed is the thing
  // worth avoiding.
  const frozenPonds = pondShare ? POND_IDS : FROZEN_PONDS;
  const forcedItemPower = forcedItemPowerRows(choices.progressiveTiers, valueOf);
  const fixedValueOf = (option: ApOptionDef) => values[option.key] ?? option.baseline;

  if (tab === 'capacity') {
    return (
      <CapacityUpgradesSection
        profile={capacity}
        fillerHeadroom={fillerHeadroom}
        notes={[...notes, ...rule.notes]}
        enabled={rule.enabled}
        progressive={choices.capacityProgressive}
        forced={rule.forcedFamilies}
        walletFloor={walletFloor}
        bonus={choices.capacityBonus}
        onChange={(family, next) => onChange(withCapacityPondRule(
          { ...choices, capacity: applyRowChange(capacity, family, next, walletFloor) }, family,
        ))}
        onBonusChange={(family, next) => onChange({
          ...choices, capacityBonus: { ...choices.capacityBonus, [family]: next },
        })}
        onEnabledChange={(capacityEnabled) => onChange({ ...choices, capacityEnabled })}
        onProgressiveChange={(capacityProgressive) => onChange({ ...choices, capacityProgressive })}
        onReset={() => onChange(withCapacityPondRule(
          { ...choices, capacity: REFERENCE_CAPACITY_PROFILE }, 'capacity',
        ))}
      />
    );
  }

  if (isUpcomingTab(tab)) {
    return (
      <UpcomingTabBody
        title={UPCOMING_TITLE}
        groups={lockedGroups[tab]}
        valueOf={fixedValueOf}
        cellOf={cellOf}
      />
    );
  }

  // Vanilla shops shuffle nothing, so every control under the mode, the price
  // rows included, is frozen: a live control that cannot change the seed is
  // the thing worth avoiding.
  const shopsShuffled = choices.shops.mode !== 'vanilla';
  const listGroups = tab === 'pond' ? pondGroupsFor(groups.pond, rule.pondModes) : groups[tab];
  const frozenKeys = tab === 'items'
    ? forcedItemPower.keys
    : (rule.pondEditable ? NO_FROZEN_KEYS : FROZEN_POND_KEYS);

  return (
    <>
      {tab === 'pond' && <PondStatusNote lines={pondStatusOf({ ...rule, pond: heldPond })} />}
      {tab === 'shops' && (
        <ShopSlotsBlock
          // The seed the random mode draws its shelves from, so the cards show
          // the set this profile will really open.
          scope={{ ...choices.shops, seed }}
          retroBow={choices.retroBow}
          onChange={(shops) => onChange({ ...choices, shops })}
        />
      )}
      {tab === 'items' && (
        <ProgressiveTiersBlock
          setting={choices.progressiveTiers}
          modes={choices.progressiveModes}
          onChange={(progressiveTiers) => onChange({ ...choices, progressiveTiers })}
          onModesChange={(progressiveModes) => onChange({ ...choices, progressiveModes })}
        />
      )}
      {tab === 'items' && (
        <DifficultyBlock
          setting={choices.difficulty}
          tiers={choices.progressiveTiers}
          onChange={(difficulty) => onChange({ ...choices, difficulty })}
        />
      )}
      {tab === 'items' && (
        <RetroBowBlock
          setting={choices.retroBow}
          capacity={capacity}
          tiers={choices.progressiveTiers}
          onChange={(retroBow) => onChange({ ...choices, retroBow })}
        />
      )}
      <OptionGroupList
        groups={listGroups}
        valueOf={tab === 'items' ? forcedItemPower.valueOf : valueOf}
        cellOf={cellOf}
        frozenKeys={frozenKeys}
        notes={tab === 'items' ? forcedItemPower.notes : undefined}
        onRowChange={onRowChange}
        live
      />
      {tab === 'shops' && (
        <ShopPricesBlock
          values={values}
          capacity={capacity}
          onChange={shopsShuffled
            ? (patch) => onChange({ ...choices, shopPrices: { ...choices.shopPrices, ...patch } })
            : undefined}
        />
      )}
      {tab === 'pond' && (
        <WishingPondSection
          profiles={shownPonds}
          capacity={capacity}
          share={pondShare}
          demands={pondDemands}
          notes={rule.notes}
          frozen={rule.pondEditable ? undefined : frozenPonds}
          onShareChange={(next) => onChange({ ...choices, pondShare: next })}
          onChange={(id, pond) => {
            const ponds = pondsWithEdit(pondProfiles, id, pond, pondShare);
            // The capacity families answer to one pond, so only its edit
            // settles the pair; the other two stand alone. While sharing, every
            // edit lands on that pond, so every edit settles it.
            onChange(id === CAPACITY_POND.id || pondShare
              ? withCapacityPondRule({ ...choices, ponds }, 'pond')
              : { ...choices, ponds });
          }}
        />
      )}
      {tab === 'world' && (
        <DarkRoomsSection
          setting={darkRoomSettingOfChoices(choices)}
          impact={cellOf(DARK_ROOM_REQUIRED_KEY)}
          forced={forcedDarkRoomLightReasons(choices.includeWorldItems)}
          onChange={(setting) => onChange(withDarkRoomSetting(choices, setting))}
        />
      )}
      <SubjectFixedRows
        tab={tab}
        lockedGroups={lockedGroups}
        valueOf={fixedValueOf}
        cellOf={cellOf}
      />
    </>
  );
};

export { OptionTabBody };
