/* @layer renderer-components @kind component */
import { ShopPricesBlock } from '@app/compounds/ShopPricesBlock';
import { ShopSlotsBlock } from '@app/compounds/ShopSlotsBlock';
import { DifficultyBlock } from '@app/compounds/DifficultyBlock';
import { ProgressiveTiersBlock } from '@app/compounds/ProgressiveTiersBlock';
import { RetroBowBlock } from '@app/compounds/RetroBowBlock';
import { PondStatusNote } from '@app/compounds/PondStatusNote';
import { WishingPondSection } from '@app/views/Randomizer/sub-components/WishingPondSection';
import { DarkRoomsSection } from '@app/views/Randomizer/sub-components/DarkRoomsSection';
import { StoryGatesSection } from '@app/views/Randomizer/sub-components/StoryGatesSection';
import { DEFAULT_STORY_GATES, holdWalletToFloor, walletFloorOf, pondStatusOf, holdPondToWallet, pondWalletTopOf, CAPACITY_POND, POND_IDS, effectivePondProfiles, DARK_ROOM_REQUIRED_KEY, forcedDarkRoomLightReasons } from '@rotp/randomizer';
import { capacityPondStateOf, withCapacityPondRule } from '@app/hooks/randomizer/capacity-pond-choices';
import { FROZEN_POND_KEYS, NO_FROZEN_KEYS, pondGroupsFor } from '@app/hooks/randomizer/pond-mode-rows';
import { darkRoomSettingOfChoices, withDarkRoomSetting } from '@app/hooks/randomizer/dark-room-choices';
import { forcedItemPowerRows } from '@app/hooks/randomizer/item-power-rows';
import { CapacityTabBody } from './CapacityTabBody';
import { OptionGroupList } from './OptionGroupList';
import { SubjectFixedRows } from './SubjectFixedRows';
import { UpcomingTabBody } from './UpcomingTabBody';
import { choiceEditOf } from './choice-edit';
import { UPCOMING_TITLE } from './option-tab-copy.constants';
import { isUpcomingTab } from './is-upcoming-tab';
import { pondsWithEdit } from './ponds-with-edit';
import { FROZEN_PONDS } from './OptionTabBody.constants';
import type { OptionDef } from '@rotp/randomizer';
import type { OptionTabBodyProps } from './OptionTabBody.type';

const OptionTabBody = (props: OptionTabBodyProps) => {
  const {
    tab, groups, lockedGroups, values, valueOf, cellOf,
    choices, seed, pondDemands, notes, fillerHeadroom, onRowChange, onChange,
  } = props;

  const readout = onChange === undefined;
  const edit = choiceEditOf(onChange);
  const rule = capacityPondStateOf(choices);
  const walletFloor = walletFloorOf(values);
  const capacity = holdWalletToFloor(rule.capacity, walletFloor);
  const heldPond = holdPondToWallet(rule.pond, pondWalletTopOf(capacity)).setting;
  const pondShare = choices.pondShare === true;
  const pondProfiles = { ...choices.ponds, capacity: rule.pond };
  const shownPonds = effectivePondProfiles(pondProfiles, pondShare);
  const frozenPonds = pondShare ? POND_IDS : FROZEN_PONDS;
  const forcedItemPower = forcedItemPowerRows(choices.progressiveTiers, valueOf);
  const fixedValueOf = (option: OptionDef) => values[option.key] ?? option.baseline;

  if (tab === 'capacity') {
    return (
      <CapacityTabBody
        choices={choices}
        rule={rule}
        capacity={capacity}
        walletFloor={walletFloor}
        notes={notes}
        fillerHeadroom={fillerHeadroom}
        onChange={onChange}
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
        readout={readout}
      />
    );
  }

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
          scope={{ ...choices.shops, seed }}
          retroBow={choices.retroBow}
          onChange={edit((shops) => ({ ...choices, shops }))}
        />
      )}
      {tab === 'items' && (
        <ProgressiveTiersBlock
          setting={choices.progressiveTiers}
          modes={choices.progressiveModes}
          onChange={edit((progressiveTiers) => ({ ...choices, progressiveTiers }))}
          onModesChange={edit((progressiveModes) => ({ ...choices, progressiveModes }))}
        />
      )}
      {tab === 'items' && (
        <DifficultyBlock
          setting={choices.difficulty}
          tiers={choices.progressiveTiers}
          onChange={edit((difficulty) => ({ ...choices, difficulty }))}
        />
      )}
      {tab === 'items' && (
        <RetroBowBlock
          setting={choices.retroBow}
          capacity={capacity}
          tiers={choices.progressiveTiers}
          onChange={edit((retroBow) => ({ ...choices, retroBow }))}
        />
      )}
      <OptionGroupList
        groups={listGroups}
        valueOf={tab === 'items' ? forcedItemPower.valueOf : valueOf}
        cellOf={cellOf}
        frozenKeys={frozenKeys}
        notes={tab === 'items' ? forcedItemPower.notes : undefined}
        onRowChange={onRowChange}
        readout={readout}
        live
      />
      {tab === 'shops' && (
        <ShopPricesBlock
          values={values}
          capacity={capacity}
          readout={readout}
          onChange={shopsShuffled
            ? edit((patch) => ({ ...choices, shopPrices: { ...choices.shopPrices, ...patch } }))
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
          readOnly={readout}
          frozen={rule.pondEditable ? undefined : frozenPonds}
          onShareChange={edit((next: boolean) => ({ ...choices, pondShare: next }))}
          onChange={onChange === undefined ? undefined : (id, pond) => {
            const ponds = pondsWithEdit(pondProfiles, id, pond, pondShare);
            onChange(id === CAPACITY_POND.id || pondShare
              ? withCapacityPondRule({ ...choices, ponds }, 'pond')
              : { ...choices, ponds });
          }}
        />
      )}
      {tab === 'goal' && (
        <StoryGatesSection
          setting={choices.storyGates ?? DEFAULT_STORY_GATES}
          cellOf={cellOf}
          onChange={edit((setting) => ({ ...choices, storyGates: setting }))}
        />
      )}
      {tab === 'world' && (
        <DarkRoomsSection
          setting={darkRoomSettingOfChoices(choices)}
          impact={cellOf(DARK_ROOM_REQUIRED_KEY)}
          forced={forcedDarkRoomLightReasons(choices.includeWorldItems)}
          onChange={edit((setting) => withDarkRoomSetting(choices, setting))}
        />
      )}
      <SubjectFixedRows
        tab={tab}
        lockedGroups={lockedGroups}
        valueOf={fixedValueOf}
        cellOf={cellOf}
        readout={readout}
      />
    </>
  );
};

export { OptionTabBody };
