/* @layer renderer-components @kind component */
import { ShopPricesBlock } from '@app/compounds/ShopPricesBlock';
import { WishingPondSection } from '@app/views/Randomizer/sub-components/WishingPondSection';
import { DarkRoomsSection } from '@app/views/Randomizer/sub-components/DarkRoomsSection';
import { StoryGatesSection } from '@app/views/Randomizer/sub-components/StoryGatesSection';
import { DARK_ROOM_REQUIRED_KEY, forcedDarkRoomLightReasons } from '@rotp/randomizer';
import { darkRoomSettingOfChoices, withDarkRoomSetting } from '@app/hooks/randomizer/dark-room-choices';
import { pondChangeOf } from './pond-change-of';
import type { TabBlocksProps } from './OptionTabBody.type';

const TabTrailBlocks = ({ tab, context }: TabBlocksProps) => {
  const {
    choices, values, capacity, readout, edit, rule, pondShare, pondDemands, shownPonds, frozenPonds, cellOf,
  } = context;
  const shopsShuffled = choices.shops.mode !== 'vanilla';

  return (
    <>
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
          onChange={pondChangeOf(context)}
        />
      )}
      {tab === 'goal' && (
        <StoryGatesSection
          setting={choices.storyGates}
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
    </>
  );
};

export { TabTrailBlocks };
