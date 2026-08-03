/* @layer shared-game @kind logic */
/**
 * An `ActorRecord` whose `combat` profile disagrees with (or is simply
 * missing, since no record in the dataset carries one yet) the resolved
 * combat row the game reports for its sprite type.
 *
 * The combat table (`kSpriteInit_Health` / `Flags4` / the per-class damage
 * lookup) is a native, enumerable fact about a SPRITE TYPE, not something
 * inferred from watching a fight — so every finding here is `certain`.
 *
 * This iterates `spriteCombat`, which is already keyed one row per sprite
 * type, rather than `liveSprites`, which is one row per spawn INSTANCE. A
 * screen that spawns the same actor twice still contributes one row to
 * `spriteCombat`, so this detector never emits more than one finding per
 * `ActorRecord` per pass regardless of how many copies are on screen — and
 * since the action is `update`, `targetId` (the record's own id) already
 * disambiguates findings for different records. No `key` is needed.
 */
import { getActorByGameId } from '../../data';
import type { ActorCombatProfile, ActorRecord } from '../../data';
import type { DetectionContext, RecommendationDetector, SpriteCombatObservation } from '../detection-types';
import type { DraftRecommendation } from '../types';

const DETECTOR_ID = 'actor-combat';

const profileFrom = (combat: SpriteCombatObservation): ActorCombatProfile => ({
  health: combat.health,
  flags4: combat.flags4,
  damageByClass: Object.fromEntries(combat.damageByClass.map((v, i) => [i, v])),
});

const sameProfile = (a: ActorCombatProfile, b: ActorCombatProfile): boolean => {
  if (a.health !== b.health || a.flags4 !== b.flags4) return false;
  const keys = new Set([...Object.keys(a.damageByClass), ...Object.keys(b.damageByClass)]);
  for (const k of keys) if ((a.damageByClass[Number(k)] ?? 0) !== (b.damageByClass[Number(k)] ?? 0)) return false;
  return true;
};

const draftFor = (current: ActorRecord, combat: SpriteCombatObservation, context: DetectionContext): DraftRecommendation<'actor'> | null => {
  const proposedProfile = profileFrom(combat);
  if (current.combat && sameProfile(current.combat, proposedProfile)) return null;

  return {
    kind: 'actor',
    action: 'update',
    targetId: current.id,
    current,
    proposed: { ...current, combat: proposedProfile },
    reason: current.combat
      ? `The native combat table reports different values (health ${combat.health}, flags4 ${combat.flags4}) than the record's stored combat profile.`
      : `The record has no combat profile; the native table reports health ${combat.health}, flags4 ${combat.flags4}.`,
    detector: DETECTOR_ID,
    evidence: [{
      source: 'native:combat-table',
      detail: `sprite type ${current.gameId.spriteType} resolves to health ${combat.health}, flags4 ${combat.flags4}`,
    }],
    confidence: 'certain',
    screenId: context.screenId,
    origin: context.origin,
  };
};

const actorCombatDetector: RecommendationDetector = {
  id: DETECTOR_ID,
  kinds: ['actor'],
  detect: (context: DetectionContext) => {
    const { spriteCombat } = context.observations;
    // Absent means "not read" — an unread combat table proves nothing.
    if (!spriteCombat) return [];

    const drafts: DraftRecommendation<'actor'>[] = [];
    for (const [key, combat] of Object.entries(spriteCombat)) {
      const actor = getActorByGameId({ spriteType: Number(key) });
      // No catalogued record for this type — that gap is `actor-spawns`'s to
      // report, since only it can propose a valid `create`.
      if (!actor) continue;
      const draft = draftFor(actor, combat, context);
      if (draft) drafts.push(draft);
    }
    return drafts;
  },
};

export { actorCombatDetector };
