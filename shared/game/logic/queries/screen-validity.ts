/* @layer shared-game @kind logic */
/**
 * The one owner of "is this screen filled in enough to be a real record".
 *
 * Every validator that guards a screen reads its rules from here, so a screen
 * the editor accepts cannot be one a query then fails to resolve. The rules are
 * phrased as the noun phrases the callers already join into a sentence ("this
 * proposal still needs …"), which is what keeps them poolable across callers.
 *
 * Two questions are deliberately NOT answered here:
 *   - Where the record belongs on disk — and the interior kind and dungeon
 *     record that decide it — is `record-file-targets`' question. Its
 *     `unresolved` reason is passed through rather than restated, so the file
 *     layout stays owned in one place too.
 *   - A grid position is the editing form's own affair: only a form can hold
 *     half of one, so only a form has to refuse it.
 */
import { PLACEHOLDER_AREA_ID, PLACEHOLDER_LOCATION_ID } from '../../data';
import { screenRecordFile } from '../../data/record-file-targets';
import { areaOfLocation } from './area-locations';
import { MAX_PROGRESS_TIER } from './progress-tier';
import type { AreaId, InteriorKind, ScreenGameId, ScreenId, ScreenKind, ScreenWorld } from '../../data';
import type { ScreenVariantInfo } from '../../data/types/screen';
import type { ScreenHome } from '../../data/record-file-targets';

/**
 * What the rules read: a stored record, or a draft that is still being filled
 * in. Geography is optional and widened to `string` because a form holds an
 * empty pick until somebody chooses, and that is one of the states being judged.
 */
interface ScreenCandidate {
  /** Absent for a screen whose id has not been allocated yet. */
  id?: ScreenId;
  kind: ScreenKind;
  world: ScreenWorld;
  interiorKind?: InteriorKind;
  areaId?: string;
  locationId?: string;
  gameId: ScreenGameId;
  variant?: ScreenVariantInfo;
}

const NEEDS_AREA = 'a real area';
const NEEDS_LOCATION = 'a real location';
const NEEDS_COHERENT_LOCATION = 'a location that belongs to the chosen area';
const NEEDS_FILE = 'a source file it can live in';
const NEEDS_REAL_TIER = `a variant progress tier within 0-${MAX_PROGRESS_TIER}`;
const NEEDS_AGREEING_TIER = 'a variant progress tier that matches its own progress condition';
const NEEDS_PALACE = 'a palace index';
const NEEDS_INDEX: Readonly<Record<ScreenKind, string>> = {
  overworld: 'an overworld index',
  dungeon: 'a room index',
  interior: 'a room index',
};

// An overworld screen is addressed by its overworld index and every indoor one
// by its room index. A dungeon room needs the palace index as well: a room
// number alone is ambiguous, since the same number can be both a dungeon room
// and a cave. Without these the screen resolves to whatever sits at index zero.
const indexBlockers = (candidate: ScreenCandidate): readonly string[] => {
  const { overworldIndex, roomIndex, palaceIndex } = candidate.gameId;
  if (candidate.kind === 'overworld') {
    return overworldIndex === undefined ? [NEEDS_INDEX.overworld] : [];
  }
  const blockers = roomIndex === undefined ? [NEEDS_INDEX[candidate.kind]] : [];
  if (candidate.kind === 'dungeon' && palaceIndex === undefined) return [...blockers, NEEDS_PALACE];
  return blockers;
};

const isPlaceholder = (id: string | undefined, placeholder: string): boolean =>
  id === undefined || id === '' || id === placeholder;

// A screen carries an area AND a location, picked from two separate lists, and
// the location record already names the area it sits in — so the two can
// disagree about where the screen is. Only a real pair is judged for that: a
// placeholder on either side is reported as its own missing piece first.
const geographyBlockers = (candidate: ScreenCandidate): readonly string[] => {
  const { areaId, locationId } = candidate;
  const blockers: string[] = [];
  if (isPlaceholder(areaId, PLACEHOLDER_AREA_ID)) blockers.push(NEEDS_AREA);
  if (isPlaceholder(locationId, PLACEHOLDER_LOCATION_ID)) blockers.push(NEEDS_LOCATION);
  if (blockers.length > 0) return blockers;

  const holder = areaOfLocation(locationId as string);
  if (holder === undefined) return [NEEDS_LOCATION];
  return holder === areaId ? [] : [NEEDS_COHERENT_LOCATION];
};

// The file resolver takes a real area id; a candidate that has not got one is
// already reported by `geographyBlockers`, and the placeholder is the value
// that resolver treats as "no geographic area", which is the honest stand-in.
const asHome = (candidate: ScreenCandidate): ScreenHome => ({
  id: candidate.id,
  kind: candidate.kind,
  world: candidate.world,
  areaId: (candidate.areaId === undefined || candidate.areaId === ''
    ? PLACEHOLDER_AREA_ID
    : candidate.areaId) as AreaId,
  interiorKind: candidate.interiorKind,
  gameId: candidate.gameId,
});

const homeBlockers = (candidate: ScreenCandidate): readonly string[] => {
  const target = screenRecordFile(asHome(candidate));
  return target.relativePath === null ? [target.unresolved ?? NEEDS_FILE] : [];
};

/** An inclusive tier range, which both encodings below are read as. */
type TierRange = readonly [number, number];

const tierRangeOf = (tier: number | [number, number]): TierRange =>
  (typeof tier === 'number' ? [tier, tier] : [tier[0], tier[1]]);

// A variant states its progress tier twice: `progressTier` names it outright,
// and a `{ type: 'progress' }` condition says the same thing in the form the
// runtime evaluates. Only the condition is read at runtime, so a disagreement
// is silent — the tier can claim one thing while the game resolves another.
// Both are normalised to an inclusive range (an omitted bound is open to the
// end of the scale, which is what the evaluator does) and must describe the
// same set. A variant gated on anything else is not judged: a flag or a check
// is a different fact that merely tends to hold from some tier onwards.
const variantBlockers = (candidate: ScreenCandidate): readonly string[] => {
  const { variant } = candidate;
  if (!variant || variant.progressTier === undefined) return [];

  const [from, to] = tierRangeOf(variant.progressTier);
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to > MAX_PROGRESS_TIER || from > to) {
    return [NEEDS_REAL_TIER];
  }
  if (variant.condition.type !== 'progress') return [];

  const min = variant.condition.min ?? 0;
  const max = variant.condition.max ?? MAX_PROGRESS_TIER;
  return from === min && to === max ? [] : [NEEDS_AGREEING_TIER];
};

/**
 * Everything standing between this screen and a dataset that can hold it, in
 * words a reviewer can act on. Empty means every rule is satisfied.
 */
const screenBlockers = (candidate: ScreenCandidate): readonly string[] => [
  ...indexBlockers(candidate),
  ...geographyBlockers(candidate),
  ...homeBlockers(candidate),
  ...variantBlockers(candidate),
];

export { screenBlockers, variantBlockers };
export type { ScreenCandidate };
