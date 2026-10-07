/* @layer renderer-components @kind component */
/**
 * The complete option catalog of the randomizer, rendered next to the creation
 * form when the randomizer is enabled, split beside the item pool it produces.
 * The catalog outgrew one column, so it is dealt into tabs by subject: the
 * world, the ending it is played to, the items, the shop block, the in-dungeon
 * items, the capacity families, the wishing pond, the subjects this version
 * has yet to build, and everything else it fixes, each keeping the
 * panel's own order inside it: the live sections first, still under their real
 * catalog headings, then the block that tab exists for. A tab wears the number
 * of its rows moved off the baseline, so a changed setting is never lost behind
 * a tab nobody opened. A subject tab may also keep the FIXED rows of its own
 * subject, which is why the locked catalog is split the same way the live one
 * is instead of handed whole to the catch-all tab.
 *
 * What does NOT move with the tabs is the feedback: the pool total sits under
 * the tab strip as the options column's own footer, and the item pool keeps
 * the right-hand pane, collapsed until asked for. A panel narrower than a split
 * can hold drops the pane and lists the item pool as the strip's last tab. Every
 * row carries its In Pool cell, computed live from the snapshot the current
 * choices would freeze, and the total, the fill bar and those cells all read the
 * same accounting, so every edit moves them together (randomizer-options/row-change.ts).
 *
 * The same panel shows a profile's stored options read-only. Given a `frozen`
 * snapshot and no change handler, every row reads that snapshot, every block
 * gets no handler, and every value is drawn as a tag in its control's place,
 * so the creation screen and the Randomizer page's Options tab are one view
 * that cannot drift apart, at every width.
 */
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
import { FIRST_OPTION_TAB, optionTabsOf } from './randomizer-options/option-tabs';
import { OptionTabBody } from './randomizer-options/OptionTabBody';
import { choicesAfterRow, valueFor } from './randomizer-options/row-change';
import type { OptionTabId } from '@app/hooks/randomizer/option-tab-model';
import type { OptionDef, OptionValue, RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';
import './RandomizerOptionsPanel.css';

interface RandomizerOptionsPanelProps {
  /** The ROM the profile is being created for; its extracted sprite set illustrates the pool. */
  romFile: string;
  /** The seed this profile will be generated with; every seeded preview reads it. */
  seed: string;
  value: RandomizerOptionChoices;
  /** Absent draws the panel read-only: every value as a tag, no control. */
  onChange?: (next: RandomizerOptionChoices) => void;
  /**
   * A profile's stored snapshot, for the read-only panel: every row and block
   * reads it instead of a snapshot rebuilt from `value`, so a profile made
   * before a catalog change still shows what it was rolled with.
   */
  frozen?: RandomizerOptionsSnapshot;
}

/** The item pool's tab, which exists only while the panel is too narrow for the split. */
const POOL_TAB = 'pool';
type PanelTab = OptionTabId | typeof POOL_TAB;

/** Share of the split the options keep; the pool pane opens on the rest. */
const OPTIONS_SHARE = 0.66;

/**
 * Narrower than this, the pool becomes a tab. The split pane stacks its panes below the same
 * width of window (SplitPane.css), so a panel wide enough to split never meets that stacking.
 */
const SPLIT_MIN_REM = 60;

const CAPTION = 'The settings, by subject. A number on a tab counts the rows inside it that '
  + 'are not on their default. The In Pool column shows what each setting adds to the item pool.';

const FROZEN_CAPTION = 'The settings this run was generated with, fixed when the profile was created. '
  + 'A number on a tab counts the rows inside it that are not on their default.';

const RandomizerOptionsPanel = (props: RandomizerOptionsPanelProps) => {
  const { romFile, seed, value, onChange, frozen } = props;
  const { unlockedGroups, lockedGroups } = catalogByLock;
  const rootRef = useRef<HTMLDivElement>(null);
  const narrow = useIsNarrow(rootRef, SPLIT_MIN_REM);
  const [chosenTab, setTab] = useState<PanelTab>(FIRST_OPTION_TAB);
  // Widening back to the split takes the pool out of the strip; its pane holds it again.
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
export type { RandomizerOptionChoices, RandomizerOptionsPanelProps };
