/* @layer renderer-hooks @kind logic */
/**
 * The option catalog, sorted into the tabs an options panel shows. Pure and
 * data-driven: a row lands on a tab from its own catalog entry — its group, or
 * one of the key sets beside this file (option-tab-keys.ts) — so a catalog
 * change moves it on its own with nothing to keep in sync here.
 *
 * The same rule answers every question a tabbed panel asks: which live groups
 * belong to a tab (so the bubbled-up sections keep their real headings inside
 * it), which FIXED groups belong to it (so a tab that owns a subject shows the
 * settings this version does not offer for that subject too), and how many of a
 * tab's rows the player has moved off the baseline, which is the count a tab
 * wears so a changed setting is never hidden behind a tab the eye skipped.
 * Values are compared as text because a snapshot may spell a ladder rung as a
 * string where the catalog spells it as a number.
 *
 * The world tab is the fallback for both, live and fixed alike: a row no
 * subject tab claims lands there rather than on a tab of its own. It held two
 * switches once and read as a shrug of a first page, so the subject that
 * describes the world now opens the panel and takes them with it.
 */
import { apOptionCatalog } from '@shared/randomizer/ap-world/options.data';
import { familyOfOptionKey } from '@shared/randomizer/ap-world/capacity';
import {
  CAPACITY_BLOCK_KEYS, ENTRANCE_KEYS, ENVIRONMENT_KEYS, GLITCH_KEYS, ITEM_KEYS, MEDALLION_KEYS,
  POND_KEYS, SHOP_KEYS, TRAP_KEYS,
} from './option-tab-keys';
import type { LockedOptionGroup } from '@domains/app/compounds/RandomizerOptionRow';
import type { ApOptionDef, ApOptionValue } from '@shared/randomizer/ap-world/options.type';

/** The faces of the options panel, in the order they are shown. */
const OPTION_TAB_IDS = [
  'world', 'goal', 'items', 'shops', 'dungeon', 'capacity', 'pond',
  'environmental', 'entrance', 'enemies', 'traps', 'minigames', 'timer', 'glitches',
] as const;

type OptionTabId = (typeof OPTION_TAB_IDS)[number];

/** The tabs that render a plain list of live rows. */
const LIST_TABS = ['world', 'goal', 'items', 'shops', 'dungeon', 'pond'] as const;

type ListTabId = (typeof LIST_TABS)[number];

/**
 * The tabs that show fixed rows. Every subject keeps its own fixed rows on its
 * own tab, so everything about that subject is one place to look. There is no
 * catch-all: the rows that used to need one were each a second spelling of a
 * control standing above them, and they are gone from the catalog rather than
 * filed away.
 *
 * The items tab keeps exactly ONE fixed row: the starting inventory, because
 * nothing above it asks what the player begins holding.
 */
const LOCKED_TABS = [
  'world', 'goal', 'items', 'shops', 'dungeon', 'environmental', 'entrance',
  'enemies', 'traps', 'minigames', 'timer', 'glitches',
] as const;

type LockedTabId = (typeof LOCKED_TABS)[number];

/** The live sections each list tab owns, already split. */
type UnlockedGroupsByTab = Readonly<Record<ListTabId, LockedOptionGroup[]>>;

/** The fixed sections each tab that shows some owns, already split. */
type LockedGroupsByTab = Readonly<Record<LockedTabId, LockedOptionGroup[]>>;

type ChangedCounts = Readonly<Record<OptionTabId, number>>;

const EMPTY_COUNTS: ChangedCounts =
  Object.fromEntries(OPTION_TAB_IDS.map((tab) => [tab, 0])) as ChangedCounts;

/**
 * Which tab owns a catalog row: the one rule every split and the count read.
 * Locked and live rows follow the same path, so the settings this version
 * fixes sit beside the ones it offers rather than being filed away elsewhere.
 */
const tabOfOption = (option: ApOptionDef): OptionTabId => {
  if (option.group === 'dungeon-items' || MEDALLION_KEYS.has(option.key)) return 'dungeon';
  // The capacity and pond rows sit in the reference's item section but have
  // tabs of their own, so they are claimed before the section is.
  if (familyOfOptionKey(option.key) !== undefined || CAPACITY_BLOCK_KEYS.has(option.key)) return 'capacity';
  if (POND_KEYS.has(option.key)) return 'pond';
  if (TRAP_KEYS.has(option.key)) return 'traps';
  if (ENVIRONMENT_KEYS.has(option.key)) return 'environmental';
  if (ENTRANCE_KEYS.has(option.key)) return 'entrance';
  if (GLITCH_KEYS.has(option.key)) return 'glitches';
  // Two rows the reference files away from the subject they change, claimed by
  // name so each sits on the tab that answers for that subject.
  if (ITEM_KEYS.has(option.key)) return 'items';
  if (SHOP_KEYS.has(option.key)) return 'shops';
  // Whole sections with a tab of their own. The environment rows above are
  // read first, because the reference files those under its enemy section too.
  if (option.group === 'enemies') return 'enemies';
  if (option.group === 'timers') return 'timer';
  // The rows about a session shared with other players. They describe how the
  // seed is PLAYED rather than what is in it, so they ride on the tab that
  // opens the panel rather than earning one of their own.
  if (option.group === 'session') return 'world';
  if (option.group === 'goal') return 'goal';
  if (option.group === 'world') return 'world';
  if (option.group === 'items') return 'items';
  if (option.group === 'shops') return 'shops';
  // Everything left. The reference's own catch-all section holds one row here,
  // the hints, and a row with no subject of its own belongs on the world tab.
  return 'world';
};

/** Where a plain row is listed; a row with a block of its own falls back to the world tab. */
const listTabOfOption = (option: ApOptionDef): ListTabId => {
  const tab = tabOfOption(option);
  return (LIST_TABS as readonly OptionTabId[]).includes(tab) ? tab as ListTabId : 'world';
};

/** Where a fixed row is listed: its own subject's tab, or the world tab. */
const lockedTabOfOption = (option: ApOptionDef): LockedTabId => {
  const tab = tabOfOption(option);
  return (LOCKED_TABS as readonly OptionTabId[]).includes(tab) ? tab as LockedTabId : 'world';
};

const emptyGroups = <T extends string>(tabs: readonly T[]): Record<T, LockedOptionGroup[]> => {
  const byTab = {} as Record<T, LockedOptionGroup[]>;
  for (const tab of tabs) byTab[tab] = [];
  return byTab;
};

/**
 * Splits the bubbled-up live groups across the tabs that show them, keeping
 * each row under its own catalog heading. A group whose rows all moved
 * elsewhere is dropped rather than left as an empty heading.
 */
const splitUnlockedGroups = (groups: readonly LockedOptionGroup[]): UnlockedGroupsByTab => {
  const byTab = emptyGroups(LIST_TABS);
  for (const { group, options } of groups) {
    for (const tab of LIST_TABS) {
      const rows = options.filter((option) => listTabOfOption(option) === tab);
      if (rows.length > 0) byTab[tab].push({ group, options: rows });
    }
  }
  return byTab;
};

/**
 * The same split for the fixed rows, so a tab that has taken a subject over
 * receives that subject's fixed rows too. Neither side filters the other's
 * rows by hand.
 */
const splitLockedGroups = (groups: readonly LockedOptionGroup[]): LockedGroupsByTab => {
  const byTab = emptyGroups(LOCKED_TABS);
  for (const { group, options } of groups) {
    for (const tab of LOCKED_TABS) {
      const rows = options.filter((option) => lockedTabOfOption(option) === tab);
      if (rows.length > 0) byTab[tab].push({ group, options: rows });
    }
  }
  return byTab;
};

const isChanged = (option: ApOptionDef, value: ApOptionValue | undefined): boolean =>
  value !== undefined && String(value) !== String(option.baseline);

/**
 * How many rows of each tab sit off their baseline, for the tab indicator.
 * Locked rows can never move, so a tab holding only locked rows always counts
 * zero and wears no indicator at all.
 */
const changedCountsOf = (values: Readonly<Record<string, ApOptionValue>>): ChangedCounts => {
  const counts = { ...EMPTY_COUNTS };
  for (const option of apOptionCatalog) {
    if (option.locked || !isChanged(option, values[option.key])) continue;
    counts[tabOfOption(option)] += 1;
  }
  return counts;
};

export { OPTION_TAB_IDS, changedCountsOf, splitLockedGroups, splitUnlockedGroups, tabOfOption };
export type { ChangedCounts, LockedGroupsByTab, LockedTabId, OptionTabId, UnlockedGroupsByTab };
