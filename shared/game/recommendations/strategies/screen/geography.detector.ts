/* @layer shared-game @kind logic */
import { findOne, getArea, getLocation, PLACEHOLDER_AREA_ID, PLACEHOLDER_LOCATION_ID } from '@rotp/game-data';
import type { AreaId, AreaRecord, LocationRecord, ScreenRecord } from '@rotp/game-data';
import { areaOfLocation, locationsInArea } from '@rotp/game-data';
import type { DetectionContext, RecommendationDetector } from '../../detection-types';
import type { DraftRecommendation } from '../../types';
import { GEOGRAPHY_DETECTOR_ID } from './geography.constants';
import type { Candidate } from './geography.type';

const nameOf = (record: AreaRecord | LocationRecord): string => record.name;

const candidateFor = (areaId: AreaId): Candidate => {
  const candidates = locationsInArea(areaId);
  const areaName = nameOf(getArea(areaId)).toLowerCase();
  const named = candidates.find(location => nameOf(location).toLowerCase() === areaName);
  return { pick: named ?? candidates[0], count: candidates.length };
};

const reasonFor = (screen: ScreenRecord, pick: LocationRecord, count: number): string => {
  const fault = `Location ${nameOf(getLocation(screen.locationId))} is not in this area.`;
  return count === 1 ? `${fault} Only ${nameOf(pick)} is.` : `${fault} ${nameOf(pick)} is a guess of ${count}.`;
};

const draftFor = (
  screen: ScreenRecord,
  holder: AreaId,
  context: DetectionContext,
): DraftRecommendation<'screen'> | null => {
  const { pick, count } = candidateFor(screen.areaId);
  if (!pick) return null;

  return {
    kind: 'screen',
    action: 'update',
    targetId: screen.id,
    current: screen,
    proposed: { ...screen, locationId: pick.id },
    reason: reasonFor(screen, pick, count),
    detector: GEOGRAPHY_DETECTOR_ID,
    evidence: [{
      source: 'dataset:geography',
      detail: `${screen.id} holds areaId=${screen.areaId} and locationId=${screen.locationId}, `
        + `which sits in ${holder}; proposed locationId=${pick.id}`,
    }],
    confidence: 'likely',
    screenId: context.screenId,
    origin: context.origin,
    key: 'locationId',
  };
};

const hasPlaceholderGeography = (screen: ScreenRecord): boolean =>
  screen.areaId === PLACEHOLDER_AREA_ID || screen.locationId === PLACEHOLDER_LOCATION_ID;

const disagreeingAreaOf = (screen: ScreenRecord): AreaId | undefined => {
  if (hasPlaceholderGeography(screen)) return undefined;
  const holder = areaOfLocation(screen.locationId);
  return holder !== undefined && holder !== screen.areaId ? holder : undefined;
};

const screenGeographyDetector: RecommendationDetector = {
  id: GEOGRAPHY_DETECTOR_ID,
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
