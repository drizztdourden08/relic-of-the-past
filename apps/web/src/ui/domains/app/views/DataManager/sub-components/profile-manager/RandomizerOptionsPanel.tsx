/* @layer renderer-components @kind component */
import { useMemo, useRef, useState } from 'react';
import { Box, ScrollArea, TabBar, Text } from '@ds/primitives';
import type { TabItem } from '@ds/primitives';
import { SplitPane } from '@ds/composites/SplitPane';
import { catalogByLock } from '@domains/app/compounds/RandomizerOptionRow';
import { PoolListing } from '@domains/app/compounds/PoolListing';
import { PoolTotals } from '@domains/app/compounds/PoolTotals';
import { parseCapacityProfile } from '@shared/randomizer/world/capacity';
import { useIsNarrow } from '@app/hooks/useIsNarrow';
import { changedCountsOf, splitLockedGroups, splitUnlockedGroups } from '@app/hooks/randomizer/option-tab-model';
import { snapshotOfChoices } from '@app/hooks/randomizer/randomizer-choices';
import { usePoolImpacts } from '@app/hooks/randomizer/usePoolImpacts';
import { usePondDemands } from '@app/hooks/randomizer/usePondDemands';
import { usePoolListing } from '@app/hooks/randomizer/usePoolListing';
import { usePoolTotals } from '@app/hooks/randomizer/usePoolTotals';
import { FIRST_OPTION_TAB } from './randomizer-options/option-tabs.constants';
import { optionTabsOf } from './randomizer-options/option-tabs-of';
import { OptionTabBody } from './randomizer-options/OptionTabBody';
import { choicesAfterRow } from './randomizer-options/choices-after-row';
import { valueFor } from './randomizer-options/value-for';
import { CAPTION, FROZEN_CAPTION, OPTIONS_SHARE, POOL_TAB, SPLIT_MIN_REM } from './RandomizerOptionsPanel.constants';
import type { OptionDef, OptionValue } from '@shared/randomizer/world/options.type';
import type { PanelTab, RandomizerOptionsPanelProps } from './RandomizerOptionsPanel.type';
import './RandomizerOptionsPanel.css';

const RandomizerOptionsPanel = (props: RandomizerOptionsPanelProps) => {
  const { romFile, seed, value, onChange, frozen } = props;
  const { unlockedGroups, lockedGroups } = catalogByLock;
  const rootRef = useRef<HTMLDivElement>(null);
  const narrow = useIsNarrow(rootRef, SPLIT_MIN_REM);
  const [chosenTab, setTab] = useState<PanelTab>(FIRST_OPTION_TAB);
  const tab = !narrow && chosenTab === POOL_TAB ? FIRST_OPTION_TAB : chosenTab;

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

  const pool = <PoolListing groups={listing} totals={totals} error={error} />;
  const body = tab === POOL_TAB ? pool : (
    <ScrollArea className="randomizer-options__body">
      <OptionTabBody
        tab={tab}
        groups={groups}
        lockedGroups={fixed}
        values={snapshot.values}
        valueOf={valueOf}
        cellOf={cellOf}
        choices={value}
        seed={seed}
        pondDemands={pondDemands}
        notes={notes}
        fillerHeadroom={accounting?.filler ?? null}
        onRowChange={onChange === undefined ? undefined : handleRowChange}
        onChange={onChange}
      />
    </ScrollArea>
  );

  const options = (
    <Box className="randomizer-options">
      <Box className="randomizer-options__header">
        <Text className="randomizer-options__title">randomizer options</Text>
        <Text variant="caption">{onChange === undefined ? FROZEN_CAPTION : CAPTION}</Text>
      </Box>
      <TabBar tabs={tabs} activeTab={tab} onTabChange={(id) => setTab(id as PanelTab)} />
      {body}
      <PoolTotals totals={totals} error={error} />
    </Box>
  );

  return (
    <Box ref={rootRef} className="randomizer-options__root">
      {narrow ? options : (
        <SplitPane
          className="randomizer-options__split"
          defaultRatio={OPTIONS_SHARE}
          defaultCollapsed="end"
          startLabel="options"
          endLabel={accounting === null ? 'item pool' : `item pool · ${accounting.items} items`}
          start={options}
          end={pool}
        />
      )}
    </Box>
  );
};

export { RandomizerOptionsPanel };
