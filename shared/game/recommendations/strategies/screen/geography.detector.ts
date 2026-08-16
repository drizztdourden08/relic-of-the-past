/* @layer shared-game @kind logic */
/**
 * A screen whose two geography ids contradict each other: it names an area, it
 * names a location, and the location record already names an area of its own.
 *
 * Hand-written rather than a `FieldProbe` because there is no live signal to
 * compare against — the game never reports which area or location a room sits
 * in. This is the dataset disagreeing with itself, so the comparison engine
 * (live value against dataset value) has nothing to work with, and only a
 * detector reading the records directly can see it.
 *
 * `screenBlockers` refuses such a pair at edit time, which stops new ones being
 * written but says nothing about the records already on disk. This is the read
 * side of the same rule: standing on one of those screens produces a finding a
 * reviewer can act on.
 */
import { findOne, getArea, getLocation, PLACEHOLDER_AREA_ID, PLACEHOLDER_LOCATION_ID } from '../../../data';
import type { AreaId, AreaRecord, LocationRecord, ScreenRecord } from '../../../data';
import { areaOfLocation, locationsInArea } from '../../../logic/queries/area-locations';
import { describeScreen } from '../../../logic/queries/describe-screen';
import type { DetectionContext, RecommendationDetector } from '../../detection-types';
import type { DraftRecommendation } from '../../types';

const DETECTOR_ID = 'screen:geography';

const nameOf = (record: AreaRecord | LocationRecord): string => record.vanillaName ?? record.randomizerName;

/** The location this screen should hold, and how many the area offers at all. */
interface Candidate {
  pick: LocationRecord | undefined;
  count: number;
}

// The fix proposed is a corrected LOCATION, never a corrected area: the screen
// files are grouped by area, and an area's own locations can go unreferenced, so
// the area is the dependable half of the pair and the location is the stale one.
const candidateFor = (areaId: AreaId): Candidate => {
  const candidates = locationsInArea(areaId);
  const areaName = nameOf(getArea(areaId)).toLowerCase();
  const named = candidates.find(location => nameOf(location).toLowerCase() === areaName);
  return { pick: named ?? candidates[0], count: candidates.length };
};

// Scanned, not read: the fault, then whether the proposed value is forced or a
// guess. Which records are involved is the evidence line's job.
const reasonFor = (screen: ScreenRecord, pick: LocationRecord, count: number): string => {
  // An area and a location often share a name, so naming both sides of the
  // mismatch reads as a contradiction. State the fault, then the proposal.
  const fault = `Location ${nameOf(getLocation(screen.locationId))} is not in this area.`;
  return count === 1 ? `${fault} Only ${nameOf(pick)} is.` : `${fault} ${nameOf(pick)} is a guess of ${count}.`;
};

const draftFor = (
  screen: ScreenRecord,
  holder: AreaId,
  context: DetectionContext,
): DraftRecommendation<'screen'> | null => {
  const { pick, count } = candidateFor(screen.areaId);
  // Nothing is filed under the area yet, so there is no value to propose.
  if (!pick) return null;

  return {
    kind: 'screen',
    action: 'update',
    targetId: screen.id,
    current: screen,
    proposed: { ...screen, locationId: pick.id },
    reason: reasonFor(screen, pick, count),
    detector: DETECTOR_ID,
    evidence: [{
      source: 'dataset:geography',
      detail: `${screen.id} holds areaId=${screen.areaId} and locationId=${screen.locationId}, `
        + `which sits in ${holder}; proposed locationId=${pick.id}`,
    }],
    // Which half of the pair is stale is inferred, and `certain` is the grade
    // batch-accept acts on.
    confidence: 'likely',
    screenId: context.screenId,
    origin: context.origin,
    key: 'locationId',
  };
};

// A placeholder on either side is "no place assigned", not a contradiction, and
// a location id no record answers to is a dangling reference — a different
// fault, with a different fix.
const disagreeingAreaOf = (screen: ScreenRecord): AreaId | undefined => {
  if (screen.areaId === PLACEHOLDER_AREA_ID || screen.locationId === PLACEHOLDER_LOCATION_ID) return undefined;
  const holder = areaOfLocation(screen.locationId);
  return holder !== undefined && holder !== screen.areaId ? holder : undefined;
};

const screenGeographyDetector: RecommendationDetector = {
  id: DETECTOR_ID,
  kinds: ['screen'],
  detect: (context: DetectionContext) => {
    const screen = context.screenId ? findOne('screen', s => s.id === context.screenId) : undefined;
    const holder = screen && disagreeingAreaOf(screen);
    if (!screen || !holder) return [];
    const draft = draftFor(screen, holder, context);
    return draft ? [draft] : [];
  },
};

export { screenGeographyDetector };
