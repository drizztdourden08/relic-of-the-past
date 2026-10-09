/* @layer test @kind data */
interface ExpectedStatusChange {
  save: string;
  checkId: string;
  from: 'completed' | 'reachable' | 'blocked';
  to: 'completed' | 'reachable' | 'blocked';
  because: string;
}

const EVERY_SAVE = '*';

const EVENT_ROW_PATH = 'the story event is no location any more, so its row reads its own record like every other event row';

const EXPECTED_STATUS_CHANGES: readonly ExpectedStatusChange[] = [
  { save: EVERY_SAVE, checkId: 'check-335', from: 'reachable', to: 'blocked', because: EVENT_ROW_PATH },
  { save: EVERY_SAVE, checkId: 'check-329', from: 'blocked', to: 'reachable', because: EVENT_ROW_PATH },
];

const STORY_EVENT_DROPPED = 'a story event of the world, found by the sweep, never a location';
const EXPECTED_DROPPED_LOCATIONS: Readonly<Record<string, string>> = {
  'check-351': STORY_EVENT_DROPPED,
  'check-329': STORY_EVENT_DROPPED,
  'check-349': STORY_EVENT_DROPPED,
  'check-337': STORY_EVENT_DROPPED,
  'check-335': STORY_EVENT_DROPPED,
  'check-336': STORY_EVENT_DROPPED,
  'check-326': STORY_EVENT_DROPPED,
  'check-324': STORY_EVENT_DROPPED,
  'slot-capacity-shop': 'no event at all: the rules read the capacity fairy\'s room and price directly',
};

const EXPECTED_NEW_CHECKS: readonly string[] = [];

const EXPECTED_SCREEN_COLUMN_CHANGE = false;

const EXPECTED_SCREEN_ADDITIONS: readonly string[] = [];

const EXPECTED_NAME_CHANGES: Readonly<Record<string, string>> = {};

const EXPECTED_PLACEMENT_CHANGES: readonly string[] = [];

export {
  EXPECTED_DROPPED_LOCATIONS, EXPECTED_NAME_CHANGES, EXPECTED_NEW_CHECKS, EXPECTED_PLACEMENT_CHANGES,
  EXPECTED_SCREEN_ADDITIONS, EXPECTED_SCREEN_COLUMN_CHANGE, EXPECTED_STATUS_CHANGES,
};
export type { ExpectedStatusChange };
