/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import { catalogByLock } from '@app/compounds/RandomizerOptionRow';
import { parseCapacityProfile } from '@rotp/randomizer';
import { changedCountsOf, splitLockedGroups, splitUnlockedGroups } from '@app/hooks/randomizer/option-tab-model';
import { snapshotOfChoices } from '@app/hooks/randomizer/randomizer-choices';
import { usePoolImpacts } from '@app/hooks/randomizer/usePoolImpacts';
import { usePondDemands } from '@app/hooks/randomizer/usePondDemands';
import { usePoolListing } from '@app/hooks/randomizer/usePoolListing';
import { usePoolTotals } from '@app/hooks/randomizer/usePoolTotals';
import { optionTabsOf } from './option-tabs-of';
import { choicesAfterRow } from './choices-after-row';
import { valueFor } from './value-for';
import { POOL_TAB } from '../RandomizerOptionsPanel.constants';
import type { OptionDef, OptionValue } from '@rotp/randomizer';
import type { RandomizerOptionsPanelProps } from '../RandomizerOptionsPanel.type';

const usePanelModel = (props: RandomizerOptionsPanelProps, narrow: boolean) => {
  const { romFile, seed, value, onChange, frozen } = props;
  const { unlockedGroups, lockedGroups } = catalogByLock;

  const snapshot = useMemo(() => frozen ?? snapshotOfChoices(value), [frozen, value]);
  const { accounting, error, cellOf } = usePoolImpacts(snapshot, seed);
  const notes = useMemo(() => parseCapacityProfile(snapshot.values).notes, [snapshot]);
  const listing = usePoolListing(snapshot, romFile || null, seed);
  const pondDemands = usePondDemands(snapshot, seed);
  const totals = usePoolTotals(accounting);

  const groups = useMemo(() => splitUnlockedGroups(unlockedGroups), [unlockedGroups]);
  const fixed = useMemo(() => splitLockedGroups(lockedGroups), [lockedGroups]);
  const optionTabs = useMemo(() => optionTabsOf(changedCountsOf(snapshot.values)), [snapshot]);
  const tabs = useMemo<TabItem[]>(
    () => (narrow ? [...optionTabs, { id: POOL_TAB, label: 'Item pool', badge: accounting?.items }] : optionTabs),
    [narrow, optionTabs, accounting],
  );
  const valueOf = (option: OptionDef): OptionValue => (frozen === undefined
    ? valueFor(option, value, snapshot.values)
    : snapshot.values[option.key] ?? option.baseline);

  const handleRowChange = (key: string, next: OptionValue): void => {
    if (onChange === undefined) return;
    const changed = choicesAfterRow(value, key, next);
    if (changed !== value) onChange(changed);
  };

  return {
    snapshot, accounting, error, cellOf, notes, listing, pondDemands, totals, groups, fixed, tabs, valueOf, handleRowChange,
  };
};

export { usePanelModel };
