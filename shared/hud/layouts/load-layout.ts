/* @layer shared-hud @kind logic */
/**
 * ONE reader, for built-in and custom layouts alike.
 *
 * A built-in is a JSON file in this repository; a custom layout is a JSON blob
 * in the player's profile. They go through this function and come out the same
 * type, and nothing downstream can tell which was which except by reading
 * `builtIn` - which is a label, not a code path. That is the honest test of the
 * format: the moment a built-in needs something a saved layout cannot have, the
 * format is too short and the format is what has to change.
 *
 * `loadLayout` throws, because everything that calls it wants a layout or
 * nothing. `tryLoadLayout` hands back the same errors for the two callers that
 * can do something better than crash: the editor, which shows them, and the
 * profile store, which falls back to the default and says so.
 */

import { migrateLegacyVitals } from './migrate-legacy-vitals';
import { migrateScreen } from './migrate-screen';
import { validateLayout } from './validate-layout';
import type { HudLayout } from '../../types/hud/hud-layout';

interface LoadFailure { ok: false; errors: string[] }
/** `warnings` is the reflow-warning channel `validate-motion-warnings.ts`
 *  populates - non-blocking, so it rides along on success only; a document
 *  that fails to load has nothing meaningful to warn about beyond its own
 *  errors. */
interface LoadSuccess { ok: true; doc: HudLayout; warnings: string[] }
type LoadResult = LoadSuccess | LoadFailure;

/**
 * A layout in hand, or every reason there is not one. Every value is
 * migrated before it is validated, in two passes and in this order:
 * `migrate-screen.ts` folds a pre-§42 `regions[]` into the screen, turns
 * every `stack` container into the one-cell grid it always was and splits a
 * pre-§57 flex `gap: n` into the `{ x: n, y: n }` both engines now take, and
 * `migrate-legacy-vitals.ts` then replaces any of the four opaque kinds phase
 * 5 deleted (`life`/`magic`/`consumables`/`wallet`) with that preset's own
 * subtree. The validator never has to know either old shape existed.
 */
const tryLoadLayout = (value: unknown): LoadResult => {
  const { doc, errors, warnings } = validateLayout(migrateLegacyVitals(migrateScreen(value)));
  return doc ? { ok: true, doc, warnings } : { ok: false, errors };
};

/** The same message a person would want: what was being read, and every line
 *  of it that was wrong. */
const failureMessage = (source: string, errors: readonly string[]): string =>
  [`${source} is not a valid HUD layout:`, ...errors.map((error) => `  - ${error}`)].join('\n');

const loadLayout = (value: unknown, source = 'this layout'): HudLayout => {
  const result = tryLoadLayout(value);
  if (!result.ok) throw new Error(failureMessage(source, result.errors));
  return result.doc;
};

export { failureMessage, loadLayout, tryLoadLayout };
export type { LoadFailure, LoadResult, LoadSuccess };
