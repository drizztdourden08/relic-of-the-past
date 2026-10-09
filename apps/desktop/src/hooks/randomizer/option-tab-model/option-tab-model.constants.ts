/* @layer renderer-hooks @kind constants */
const OPTION_TAB_IDS = [
  'world', 'goal', 'items', 'shops', 'dungeon', 'capacity', 'pond',
  'environmental', 'entrance', 'enemies', 'traps', 'minigames', 'timer', 'glitches',
] as const;

const LIST_TABS = ['world', 'goal', 'items', 'shops', 'dungeon', 'pond'] as const;

const LOCKED_TABS = [
  'world', 'goal', 'items', 'shops', 'dungeon', 'environmental', 'entrance',
  'enemies', 'traps', 'minigames', 'timer', 'glitches',
] as const;

const EMPTY_COUNTS: Readonly<Record<(typeof OPTION_TAB_IDS)[number], number>> =
  Object.fromEntries(OPTION_TAB_IDS.map((tab) => [tab, 0])) as Readonly<Record<(typeof OPTION_TAB_IDS)[number], number>>;

export { EMPTY_COUNTS, LIST_TABS, LOCKED_TABS, OPTION_TAB_IDS };
