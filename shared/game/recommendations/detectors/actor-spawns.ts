/* @layer shared-game @kind logic */
/**
 * A live sprite spawn with no `ActorRecord` cataloguing its sprite type at all.
 *
 * The native spawn table for the loaded room is fully enumerable, so a spawn
 * whose `spriteType` no record's `gameId.spriteType` names is a proven gap, not
 * a guess — `certain`. What is genuinely NOT provable from a spawn table alone
 * is the actor's `kind` (enemy / boss / npc / object): the game does not carry
 * that classification on the spawn byte, and the real dataset's own census
 * assigns it by hand per sprite type. Inventing 'enemy' or 'npc' outright would
 * be exactly the guessing `screenIdentityDetector` refuses to do for authoring
 * gaps, so this detector defaults to the one signal it DOES have: a populated
 * combat row (`spriteCombat`) is native proof the sprite fights, so it proposes
 * `'enemy'`; with no combat row it falls back to `'object'`, the dataset's own
 * catch-all for sprite-type actors it has not yet classified. Either way a
 * human still reviews the proposal before it lands — the gap this closes is
 * "nothing exists to review", not "the review is unnecessary".
 */
import { getActorByGameId } from '../../data';
import type { ActorRecord } from '../../data';
import type {
  DetectionContext, LiveSpriteObservation, RecommendationDetector, SpriteCombatObservation,
} from '../detection-types';
import type { DraftRecommendation } from '../types';

const DETECTOR_ID = 'actor-spawns';

const hex = (n: number): string => `0x${n.toString(16).toUpperCase()}`;

const proposedFor = (spriteType: number, combat: SpriteCombatObservation | undefined): Omit<ActorRecord, 'id'> => ({
  gameId: { spriteType },
  // See the file header: 'enemy' only when the native combat row proves it
  // fights, 'object' otherwise — never a name-level guess like 'npc'/'boss'.
  kind: combat ? 'enemy' : 'object',
  ...(combat ? {
    combat: { health: combat.health, flags4: combat.flags4, damageByClass: Object.fromEntries(combat.damageByClass.map((v, i) => [i, v])) },
  } : {}),
});

const draftFor = (spriteType: number, combat: SpriteCombatObservation | undefined, context: DetectionContext): DraftRecommendation<'actor'> => ({
  kind: 'actor',
  action: 'create',
  // No id yet — the main-process allocator mints it.
  targetId: null,
  current: null,
  proposed: proposedFor(spriteType, combat),
  reason: `A live sprite spawn reports type ${hex(spriteType)}, which no ActorRecord's gameId.spriteType covers.`,
  detector: DETECTOR_ID,
  evidence: [{ source: 'native:sprite-spawns', detail: `sprite type ${hex(spriteType)} spawns here with no catalogued record` }],
  confidence: 'certain',
  screenId: context.screenId,
  origin: context.origin,
  // A screen can spawn several uncatalogued types at once, and a `create` has
  // no target id to tell them apart — the sprite type is what does.
  key: `spriteType:${spriteType}`,
});

/** One draft per distinct missing sprite type — repeat spawns of the same
 *  uncatalogued type on one screen collapse into a single finding. */
const missingSpawns = (spawns: readonly LiveSpriteObservation[]): number[] => {
  const seen = new Set<number>();
  const missing: number[] = [];
  for (const spawn of spawns) {
    if (seen.has(spawn.spriteType)) continue;
    seen.add(spawn.spriteType);
    if (!getActorByGameId({ spriteType: spawn.spriteType })) missing.push(spawn.spriteType);
  }
  return missing;
};

const actorSpawnsDetector: RecommendationDetector = {
  id: DETECTOR_ID,
  kinds: ['actor'],
  detect: (context: DetectionContext) => {
    const { liveSprites, spriteCombat } = context.observations;
    // Absent means "not read" — treating that as "nothing spawns here" would
    // be reading an unread table as proof of absence.
    if (!liveSprites) return [];
    return missingSpawns(liveSprites).map(spriteType => draftFor(spriteType, spriteCombat?.[spriteType], context));
  },
};

export { actorSpawnsDetector };
