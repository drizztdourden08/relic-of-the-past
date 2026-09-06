/* @layer renderer-components @kind component */
/**
 * The complete option catalog of the randomizer, rendered next to the creation
 * form when the randomizer is enabled, split beside the item pool it produces.
 * The catalog outgrew one column, so it is dealt into tabs by subject — the
 * world, the ending it is played to, the items, the shop block, the in-dungeon
 * items, the capacity families, the wishing pond, the subjects this version
 * has yet to build, and everything else it fixes — each keeping the
 * panel's own order inside it: the live sections first, still under their real
 * catalog headings, then the block that tab exists for. A tab wears the number
 * of its rows moved off the baseline, so a changed setting is never lost behind
 * a tab nobody opened. A subject tab may also keep the FIXED rows of its own
 * subject, which is why the locked catalog is split the same way the live one
 * is rather than handed whole to the catch-all tab.
 *
 * What does NOT move with the tabs is the feedback: the pool total sits under
 * the tab strip as the options column's own footer, and the item pool keeps
 * the right-hand pane, collapsed until asked for. Every row carries its In
 * Pool cell, computed live from the snapshot the current choices would freeze,
 * and the total, the fill bar and those cells all read the same accounting, so
 * every edit moves them together. Plain unlocked rows resolve their value and
 * change handler through the catalog-key → form-field map, so a new unlocked
 * toggle is one map row plus its form field.
 */
import { useMemo, useState } from 'react';
import { Box, ScrollArea, TabBar, Text } from '@ds/primitives';
import { SplitPane } from '@ds/composites/SplitPane';
import { apCatalogByLock } from '@domains/app/compounds/RandomizerOptionRow';
import { PoolListing } from '@domains/app/compounds/PoolListing';
import { PoolTotals } from '@domains/app/compounds/PoolTotals';
import { CAPACITY_ENABLED_KEY, parseCapacityProfile } from '@shared/randomizer/ap-world/capacity';
import {
  changedCountsOf, splitLockedGroups, splitUnlockedGroups,
} from '../../../../../../../hooks/randomizer/option-tab-model';
import {
  CHOICE_FIELDS, NUMERIC_FIELDS, PLAIN_FIELD_BY_KEY, snapshotOfChoices,
} from '../../../../../../../hooks/randomizer/randomizer-choices';
import { usePoolImpacts } from '../../../../../../../hooks/randomizer/usePoolImpacts';
import { usePoolListing } from '../../../../../../../hooks/randomizer/usePoolListing';
import { usePoolTotals } from '../../../../../../../hooks/randomizer/usePoolTotals';
import { FIRST_OPTION_TAB, optionTabsOf } from './randomizer-options/option-tabs';
import { OptionTabBody } from './randomizer-options/OptionTabBody';
import type { OptionTabId } from '../../../../../../../hooks/randomizer/option-tab-model';
import type { ApOptionDef, ApOptionValue } from '@shared/randomizer/ap-world/options.type';
import { pondSettingForMode } from '@shared/randomizer/ap-world/pond/pond-mode-switch';
import { POND_MODE_KEY } from '@shared/randomizer/ap-world/pond/pond-option-keys';
import { withCapacityPondRule } from '../../../../../../../hooks/randomizer/capacity-pond-choices';
import type { RandomizerOptionChoices } from '../../../../../../../hooks/randomizer/randomizer-choices';
import type { PondMode } from '@shared/randomizer/ap-world/pond/pond-profile.type';
import './RandomizerOptionsPanel.css';

interface RandomizerOptionsPanelProps {
  /** The ROM the profile is being created for; its extracted sprite set illustrates the pool. */
  romFile: string;
  value: RandomizerOptionChoices;
  onChange: (next: RandomizerOptionChoices) => void;
}

/** Share of the split the options keep; the pool pane opens on the rest. */
const OPTIONS_SHARE = 0.66;

const CAPTION = 'The settings, by subject. A number on a tab counts the rows inside it that '
  + 'are not on their default. The In Pool column shows what each setting adds to the item pool.';

/**
 * The value a row shows. The master switch and the pond mode are read off the
 * SNAPSHOT rather than the raw choices, because the snapshot is the pair after
 * the capacity/pond rule has settled it — the row has to say what the seed
 * will be built from, not what was asked for before the rule answered.
 */
const valueFor = (
  option: ApOptionDef, chosen: RandomizerOptionChoices, values: Readonly<Record<string, ApOptionValue>>,
): ApOptionValue => {
  if (option.key === CAPACITY_ENABLED_KEY || option.key === POND_MODE_KEY) return values[option.key];
  const field = PLAIN_FIELD_BY_KEY[option.key];
  return field === undefined ? option.baseline : chosen[field];
};

const RandomizerOptionsPanel = (props: RandomizerOptionsPanelProps) => {
  const { romFile, value, onChange } = props;
  const { unlockedGroups, lockedGroups } = apCatalogByLock;
  const [tab, setTab] = useState<OptionTabId>(FIRST_OPTION_TAB);

  const snapshot = useMemo(() => snapshotOfChoices(value), [value]);
  const { accounting, error, cellOf } = usePoolImpacts(snapshot);
  const notes = useMemo(() => parseCapacityProfile(snapshot.values).notes, [snapshot]);
  const listing = usePoolListing(snapshot, romFile || null);
  const totals = usePoolTotals(accounting);

  const groups = useMemo(() => splitUnlockedGroups(unlockedGroups), [unlockedGroups]);
  const fixed = useMemo(() => splitLockedGroups(lockedGroups), [lockedGroups]);
  const tabs = useMemo(() => optionTabsOf(changedCountsOf(snapshot.values)), [snapshot]);
  const valueOf = (option: ApOptionDef): ApOptionValue => valueFor(option, value, snapshot.values);

  const handleRowChange = (key: string, next: ApOptionValue): void => {
    if (key === POND_MODE_KEY) {
      const pond = pondSettingForMode(String(next) as PondMode, value.pond);
      onChange(withCapacityPondRule({ ...value, pond }, 'pond'));
      return;
    }
    const field = PLAIN_FIELD_BY_KEY[key];
    if (field === undefined) return;
    // A select row writes the catalog's own key, a slider a number, a toggle a
    // boolean — coercing a chosen key to Boolean would store `true` for every
    // value the row offers.
    if (CHOICE_FIELDS.has(field)) {
      onChange({ ...value, [field]: String(next) } as RandomizerOptionChoices);
      return;
    }
    onChange({ ...value, [field]: NUMERIC_FIELDS.has(field) ? Number(next) : Boolean(next) });
  };

  const options = (
    <Box className="randomizer-options">
      <Box className="randomizer-options__header">
        <Text className="randomizer-options__title">randomizer options</Text>
        <Text variant="caption">{CAPTION}</Text>
      </Box>
      <TabBar tabs={tabs} activeTab={tab} onTabChange={(id) => setTab(id as OptionTabId)} />
      <ScrollArea className="randomizer-options__body">
        <OptionTabBody
          tab={tab}
          groups={groups}
          lockedGroups={fixed}
          values={snapshot.values}
          valueOf={valueOf}
          cellOf={cellOf}
          choices={value}
          notes={notes}
          fillerHeadroom={accounting?.filler ?? null}
          onRowChange={handleRowChange}
          onChange={onChange}
        />
      </ScrollArea>
      <PoolTotals totals={totals} error={error} />
    </Box>
  );

  return (
    <SplitPane
      className="randomizer-options__split"
      defaultRatio={OPTIONS_SHARE}
      defaultCollapsed="end"
      startLabel="options"
      endLabel={accounting === null ? 'item pool' : `item pool · ${accounting.items} items`}
      start={options}
      end={<PoolListing groups={listing} totals={totals} error={error} />}
    />
  );
};

export { RandomizerOptionsPanel };
export type { RandomizerOptionChoices, RandomizerOptionsPanelProps };
