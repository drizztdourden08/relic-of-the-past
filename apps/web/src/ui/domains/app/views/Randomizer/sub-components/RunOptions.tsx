/* @layer renderer-components @kind component */
/**
 * The options this run was generated with, read straight off the profile's
 * frozen snapshot, never the current baselines, so a profile made before a
 * catalog change still shows what it actually played. Player choices (the
 * unlocked rows) come first because they are the only part that varied,
 * then the blocks that own their own rows (the dark-room section, the shop
 * scope and its prices) each read-only,
 * then the four capacity family rows read-only with their ladders as a
 * section of their own; then the pool total; then the locked rest of the
 * catalog, one folding section per group. Every row carries its In Pool
 * cell from the same accounting the creation panel showed.
 */
import { useMemo, useState } from 'react';
import { Box, Text } from '@ds/primitives';
import { RandomizerOptionRow, apCatalogByLock } from '@domains/app/compounds/RandomizerOptionRow';
import { RandomizerOptionGroup } from '@domains/app/compounds/RandomizerOptionGroup';
import { PoolTotals } from '@domains/app/compounds/PoolTotals';
import { CapacityUpgradesSection } from './CapacityUpgradesSection';
import { ShopPricesBlock } from '@domains/app/compounds/ShopPricesBlock';
import { ShopSlotsBlock } from '@domains/app/compounds/ShopSlotsBlock';
import { WishingPondSection } from './WishingPondSection';
import { DarkRoomsSection } from './DarkRoomsSection';
import { normalizeRandomizerOptions } from '@shared/randomizer/options-snapshot';
import {
  capacityBonusOfValues, capacityEnabledOf, capacityProgressiveOf, parseCapacityProfile, walletFloorOf,
} from '@shared/randomizer/ap-world/capacity';
import { reconcileCapacityPond } from '@shared/randomizer/ap-world/capacity-pond';
import { retroBowFromSnapshot } from '@shared/randomizer/ap-world/retro/retro-from-snapshot';
import { forcedDarkRoomLightReasons } from '@shared/randomizer/ap-world/dark-rooms/dark-room-forced';
import { darkRoomSettingFromSnapshot } from '@shared/randomizer/ap-world/dark-rooms/dark-room-from-snapshot';
import { DARK_ROOM_REQUIRED_KEY } from '@shared/randomizer/ap-world/dark-rooms/dark-room-option-keys';
import { includeWorldItemsOf } from '@shared/randomizer/ap-world/scope-option-keys';
import { parsePondSetting } from '@shared/randomizer/ap-world/pond/pond-from-snapshot';
import { shopScopeOfValues } from '@shared/randomizer/ap-world/shops/shop-scope-from-values';
import { retroBowOfValues } from '@shared/randomizer/ap-world/retro/retro-from-snapshot';
import { usePoolImpacts } from '../../../../../../hooks/randomizer/usePoolImpacts';
import { usePoolTotals } from '../../../../../../hooks/randomizer/usePoolTotals';

interface RunOptionsProps {
  /** The profile's stored options: a snapshot, or a pre-snapshot config shape. */
  options: unknown;
  /** The seed this run was generated with; a gamble's winning throws come from it. */
  seed?: string;
}

const RunOptions = ({ options, seed = '' }: RunOptionsProps) => {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const snapshot = useMemo(() => normalizeRandomizerOptions(options), [options]);
  const { values } = snapshot;
  const { accounting, error, cellOf } = usePoolImpacts(snapshot);
  const parsed = useMemo(() => parseCapacityProfile(values), [values]);
  // The floor the profile was read under, so its rows say the same thing the panel did.
  const walletFloor = useMemo(() => walletFloorOf(values), [values]);
  const pond = useMemo(() => parsePondSetting(values), [values]);
  const darkRooms = useMemo(() => darkRoomSettingFromSnapshot(snapshot), [snapshot]);
  // The reading above is already masked; this only recovers the sentence saying why.
  const forcedLights = useMemo(() => forcedDarkRoomLightReasons(includeWorldItemsOf(values)), [values]);
  // The scope this run was generated with, including the seed its random mode drew from.
  const shops = useMemo(() => shopScopeOfValues(values, seed), [values, seed]);
  const retroBow = useMemo(() => retroBowOfValues(values), [values]);
  // The pair as it was frozen: the snapshot is already reconciled, so this
  // only recovers the sentences explaining why it reads the way it does.
  const rule = useMemo(() => reconcileCapacityPond({
    enabled: capacityEnabledOf(values), capacity: parsed.profile, pond: pond.setting,
    retroBow: retroBowFromSnapshot(snapshot).enabled,
  }), [values, parsed, pond, snapshot]);
  const totals = usePoolTotals(accounting);
  const { unlockedGroups, lockedGroups } = apCatalogByLock;

  return (
    <Box className="randomizer-page__panel">
      <Text className="randomizer-page__panel-title">Options</Text>

      {unlockedGroups.map(({ group, options: groupOptions }) => (
        <RandomizerOptionGroup key={`live-${group.id}`} title={group.label} live>
          {groupOptions.map((option) => (
            <RandomizerOptionRow key={option.key} option={option} value={values[option.key]} impact={cellOf(option.key)} />
          ))}
        </RandomizerOptionGroup>
      ))}
      <DarkRoomsSection setting={darkRooms} impact={cellOf(DARK_ROOM_REQUIRED_KEY)} forced={forcedLights} />
      <ShopSlotsBlock scope={shops} retroBow={retroBow} />
      <ShopPricesBlock values={values} capacity={rule.capacity} />
      <CapacityUpgradesSection
        profile={parsed.profile}
        fillerHeadroom={accounting?.filler ?? null}
        notes={[...parsed.notes, ...rule.notes]}
        enabled={rule.enabled}
        progressive={capacityProgressiveOf(values)}
        forced={rule.forcedFamilies}
        walletFloor={walletFloor}
        bonus={capacityBonusOfValues(values)}
        readOnly
      />
      <WishingPondSection
        setting={pond.setting}
        capacity={parsed.profile}
        seed={seed}
        notes={[...pond.notes, ...rule.notes]}
        readOnly
      />
      <PoolTotals totals={totals} error={error} />

      <Text variant="caption">Fixed when the profile was created.</Text>

      {lockedGroups.map(({ group, options: groupOptions }) => {
        const open = openGroup === group.id;
        return (
          <RandomizerOptionGroup
            key={group.id}
            title={group.label}
            count={groupOptions.length}
            open={open}
            onToggle={() => setOpenGroup(open ? null : group.id)}
          >
            {groupOptions.map((option) => (
              <RandomizerOptionRow key={option.key} option={option} value={values[option.key]} impact={cellOf(option.key)} />
            ))}
          </RandomizerOptionGroup>
        );
      })}
    </Box>
  );
};

export { RunOptions };
export type { RunOptionsProps };
