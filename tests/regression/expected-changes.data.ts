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
 * The baseline is `story-events-floor`, captured on 2026-09-27 after the Archipelago merge
 * (ROTP_NET_LABEL=story-events-floor). The one-source step's declarations went with it: every row
 * it moved is part of that baseline now. A new step starts here with every list empty.
 */

/** Statuses this step may move. Empty means the step must change nothing. */
const EXPECTED_STATUS_CHANGES: readonly ExpectedStatusChange[] = [];

/**
 * Check ids this step ADDS to the dataset, so a save reporting one as completed is allowed.
 * Every other completion has to read exactly as it did, which is what catches a new record
 * that steals an existing row's bit.
 */
const EXPECTED_NEW_CHECKS: readonly string[] = [];

/**
 * Whether this step may move the `reachableScreens` column wholesale.
 *
 * True only for a step that changes how the column is DERIVED, never to wave a per-row surprise
 * through.
 */
const EXPECTED_SCREEN_COLUMN_CHANGE = false;

/**
 * Screens this step may ADD to the `reachableScreens` column, and nothing else may appear there.
 * A screen leaving the column is never declarable, so the reading still catches a loss.
 */
const EXPECTED_SCREEN_ADDITIONS: readonly string[] = [];

/** Check ids whose standard name this step may change, old name to new. */
const EXPECTED_NAME_CHANGES: Readonly<Record<string, string>> = {};

/** Seeds whose placement this step may change. A rename alone never belongs here. */
const EXPECTED_PLACEMENT_CHANGES: readonly string[] = [];

export {
  EXPECTED_NAME_CHANGES, EXPECTED_NEW_CHECKS, EXPECTED_PLACEMENT_CHANGES, EXPECTED_SCREEN_ADDITIONS,
  EXPECTED_SCREEN_COLUMN_CHANGE, EXPECTED_STATUS_CHANGES,
};
export type { ExpectedStatusChange };
