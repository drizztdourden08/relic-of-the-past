/* @layer test @kind data */
/**
 * The rows the step being worked on is ALLOWED to move, and the names it is allowed to change.
 *
 * A refactor step leaves both lists empty and must move nothing. A behaviour step writes its
 * rows here BEFORE it runs, so the change is reviewable next to the code that caused it.
 *
 * A difference is never accepted by regenerating the baseline. That turns the net into
 * decoration: the baseline would learn whatever the bug did.
 */

interface ExpectedStatusChange {
  /** A corpus save name, or '*' for every save in the corpus. */
  save: string;
  checkId: string;
  from: 'completed' | 'reachable' | 'blocked';
  to: 'completed' | 'reachable' | 'blocked';
  /** Why this is correct, in one line. Read during review, not by the test. */
  because: string;
}

/**
 * Statuses this step may move. Empty means the step must change nothing.
 *
 * Three event rows, from replacing the two bridge tables with `regionId` on the screen. The
 * rows sit on screen-171 (Secret Passage) and screen-205 (Starting House, intro variant), two
 * of the screens the retired membership table never listed, so their region did not reach
 * them and the rows read as blocked on every file that had not done them. The region reaches
 * them now (see EXPECTED_SCREEN_ADDITIONS below), which is the reading the game has always
 * had: the opening rooms are open from the first frame.
 */
const EXPECTED_STATUS_CHANGES: readonly ExpectedStatusChange[] = [
  { save: '*', checkId: 'check-001', from: 'blocked', to: 'reachable', because: 'screen-205 gained its regionId; the intro room was never unreachable' },
  { save: '*', checkId: 'check-002', from: 'blocked', to: 'reachable', because: 'screen-171 gained its regionId; the secret passage was never unreachable' },
  { save: '*', checkId: 'check-300', from: 'blocked', to: 'reachable', because: 'screen-171 gained its regionId; the secret passage was never unreachable' },
];

/**
 * Check ids this step ADDS to the dataset, so a save reporting one as completed is allowed.
 * Every other completion has to read exactly as it did, which is what catches a new record
 * that steals an existing row's bit.
 *
 * The 31 shop slots, in canonical order: every purchasable spot in the world becomes a check
 * record of its own. None of them can report as completed on a plain file, because the
 * unmodified game records nothing for a bought shelf item; they are listed so a save that
 * ever did report one gets reviewed, not waved through.
 *
 * Then two Ganon's Tower chests the native chest table holds and no record named, rooms 0x05
 * and 0x5B. Both are the only chest of their room, so a save that reports one opened is a real
 * reading, which is why they are declared instead of dropped.
 */
const EXPECTED_NEW_CHECKS: readonly string[] = [
  'check-626', 'check-627', 'check-628', 'check-629', 'check-630', 'check-631', 'check-632',
  'check-633', 'check-634', 'check-635', 'check-636', 'check-637', 'check-638', 'check-639',
  'check-640', 'check-641', 'check-642', 'check-643', 'check-644', 'check-645', 'check-646',
  'check-647', 'check-648', 'check-649', 'check-650', 'check-651', 'check-652', 'check-653',
  'check-654', 'check-655', 'check-656',
  'check-657', 'check-658',
];

/**
 * Whether this step may move the `reachableScreens` column wholesale.
 *
 * True only for a step that changes how the column is DERIVED, never to wave a per-row surprise
 * through. False here: the tree move changes no derivation.
 */
const EXPECTED_SCREEN_COLUMN_CHANGE = false;

/**
 * Screens this step may ADD to the `reachableScreens` column, and nothing else may appear there.
 * A screen leaving the column is never declarable, so the reading still catches a loss.
 *
 * Six, from replacing the two bridge tables with `regionId` on the screen. Each is a screen the
 * dataset holds and the retired membership table never listed, so its region reached it and this
 * column did not say so. The maximal union over all 239 regions gains exactly these six and
 * loses none, which was read screen by screen before this was written:
 *
 * - screen-171 Secret Passage: both of Hyrule Castle Secret Entrance's own locations
 *   (Link's Uncle, Secret Passage) sit on it, and the old table pointed the region at the other
 *   room of the same passage.
 * - screen-205 Starting House (Intro): the same room as screen-204, as its intro variant.
 * - screen-232 Dark Death Mountain Bunny Descent: the record's name drops the reference's
 *   trailing "Area", so the old name lookup missed its own screen.
 * - screen-270 Bungie Cave Fun Zone (ow 0x4A): the C area table measures the Bumper Cave Ledge
 *   box on head 0x4A, so the walkable level of that screen is the Bumper Cave Entrance.
 * - screen-459 Paradox Cave Upper: five of Paradox Cave Chest Area's seven locations sit on it.
 * - screen-488 Blinds Hideout (bottom): all five of Blind's Hideout's locations sit on it.
 *
 * Then five rooms a door opens into that the dataset held nowhere, each the far half of a place
 * it already holds, so each joins a region that was already reached and none of them can take a
 * check away from another screen:
 *
 * - screen-489 Old Man Cave (East), room 0xF1: the mountain-side half of Old Man Cave.
 * - screen-490 Death Mountain Return Cave (East), room 0xE7: the far half of the return cave.
 * - screen-491 Elder House (East), room 0xF3: the east room of a house with two doors.
 * - screen-492 Two Brothers House (East), room 0xF5: the same shape, on the race ledge side.
 * - screen-493 North Fairy Cave (Cave), room 0x08: the room the door opens into, where the
 *   fairy stands; screen-162 keeps the room the drop lands in.
 *
 * Then one more, from settling the East Death Mountain rooms against the exit table:
 *
 * - screen-494 Bumper Cave (Top), room 0xEB: the Bumper Cave is two rooms behind two doors on
 *   overworld 0x4A, and the dataset held one screen for it while its second room was lent to a
 *   light-world cave. The new screen joins region-153, which screen-474 already reached, so it
 *   cannot take a check from another screen.
 */
const EXPECTED_SCREEN_ADDITIONS: readonly string[] = [
  'screen-171', 'screen-205', 'screen-232', 'screen-270', 'screen-459', 'screen-488',
  'screen-489', 'screen-490', 'screen-491', 'screen-492', 'screen-493',
  'screen-494',
];

/**
 * Check ids whose standard name this step may change, old name to new.
 *
 * One row. The events used to carry a second name for the reference project's own spelling,
 * and one event answered to it: the pickup it calls "Dark Blacksmith Ruins" is our "Purple
 * Chest found". A record has one name now, so the story moment is the name and the other
 * spelling is gone.
 */
const EXPECTED_NAME_CHANGES: Readonly<Record<string, string>> = {
  'Dark Blacksmith Ruins': 'Purple Chest found',
};

/**
 * Seeds whose placement this step may change. A rename alone never belongs here.
 *
 * EMPTY, and it can stay empty from now on. A placement is keyed by ID, so a relabel cannot
 * reach one at all, which is what the six rows here were for: the location renamed above was a
 * key of every placement's name view and a word in its spheres. The gate reads an older
 * name-keyed baseline into those keys before comparing (legacy-placement-shot.ts), so nothing
 * is waved through for the key change either.
 */
const EXPECTED_PLACEMENT_CHANGES: readonly string[] = [];

export {
  EXPECTED_NAME_CHANGES, EXPECTED_NEW_CHECKS, EXPECTED_PLACEMENT_CHANGES, EXPECTED_SCREEN_ADDITIONS,
  EXPECTED_SCREEN_COLUMN_CHANGE, EXPECTED_STATUS_CHANGES,
};
export type { ExpectedStatusChange };
