/* @layer shared-game @kind logic */
/**
 * The save's progress indicator byte — what each of its four values means, and
 * the one place anything asks what to call one.
 *
 * The byte is the game's coarsest story clock. The engine branches on it
 * directly (`< 2`, `>= 2`, `== 2`, `< 3`, `>= 3`), so the tiers are the engine's
 * own, not a reading of the plot:
 *
 * - 0 — the opening. The storm is up, no sword has been given, and the
 *   overworld runs the first sprite list (overworld.c:302-306) with the rain
 *   ambience (overworld.c:481, `< 2`).
 * - 1 — the passage scene has handed over the sword and shield
 *   (sprite_main.c:5739, `Uncle_InPassage` case 1 `GiveSwordAndShield`). The
 *   storm and its sprite list are unchanged: everything the engine keys on
 *   still tests `< 2`, so 0 and 1 share the same overworld.
 * - 2 — the princess has been delivered to the sanctuary and the priest scene
 *   has run (sprite_main.c:6343; the simulator writes the same value in
 *   core/game-hooks/sim_triggers.c). The storm lifts, sprite list 1 takes over
 *   and the sign text changes.
 * - 3 — the tower boss is down and the dark world opens (dungeon.c:2504, on the
 *   exit that also flips `savegame_is_darkworld`). Sprite list 2 takes over.
 *
 * The LABELS live with the rest of the dataset, as the `progress-tier`
 * enumeration category, so a tier reads the same in a HUD chip, a record editor
 * and a log line. Nothing else may declare its own table of them: the several
 * that used to exist disagreed with each other about tier 1.
 */
import { enumerationFor, labelOf } from '../../data';

/** The enumeration category holding one row per tier. */
const PROGRESS_TIER_CATEGORY = 'progress-tier';

/** The highest value the byte takes — the dark world is the last thing it counts. */
const MAX_PROGRESS_TIER = 3;

/**
 * What to call one tier. Undefined for a value the dataset does not describe,
 * which a caller reports as the raw number rather than inventing a name for —
 * a checkout without the private dataset has no rows at all.
 */
const progressTierLabel = (tier: number): string | undefined =>
  labelOf(PROGRESS_TIER_CATEGORY, String(tier));

/** Every tier as a numeric value and its label, in tier order. */
const progressTierOptions = (): readonly { value: number; label: string }[] =>
  enumerationFor(PROGRESS_TIER_CATEGORY)
    .map(entry => ({ value: Number(entry.value), label: entry.label }))
    .filter(option => Number.isInteger(option.value))
    .sort((a, b) => a.value - b.value);

export { MAX_PROGRESS_TIER, PROGRESS_TIER_CATEGORY, progressTierLabel, progressTierOptions };
