/* @layer shared-game @kind logic */
/**
 * Normal play as a placement: every location holding what it holds in the unmodified game.
 *
 * This is what lets one engine answer for both modes. Normal stops being a second set of
 * rules and becomes the seed where nothing moved, so the engine cannot tell the two apart
 * and therefore cannot disagree with itself. Nothing is shuffled and no rng is drawn, so the
 * result is the same every time.
 */
import { buildWorld } from './world/build-world';
import { sweepPlacementSpheres } from './world/fill/verify-placement';
import { REFERENCE_DARK_ROOM_SETTING } from './world/dark-rooms/dark-room-lights.data';
import { VANILLA_MEDALLIONS } from './world/item-groups';
import { originalContentOf, recordedContents } from './original-contents';
import { normalPlacementStats } from './normal-placement-stats';
import type { ItemKey } from './world/item-ids.data';
import type { LocationKey } from './world/location-key';
import type { Placement } from './world/fill/placement.type';
import type { WorldOptions } from './world/world.type';
import type { StoryGateSetting } from './world/story-gates/story-gate.type';

/** The medallion pair the unmodified game uses. */
const ORIGINAL_MEDALLIONS = VANILLA_MEDALLIONS;
const NORMAL_SEED = 'normal';
/**
 * What an unlit room asks for in Normal: the generator's own dark-room model, carrying the one
 * light the unmodified game gives. Written down instead of left to a default, so the tracker
 * rebuilds this world with the reading Normal was measured under and its own "dark rooms need a
 * light" switch composes from a stated base.
 */
const NORMAL_DARK_ROOMS = REFERENCE_DARK_ROOM_SETTING;

interface NormalPlacementParams {
  /** What the profile's story moments ask for. Absent means the story as the game tells it. */
  storyGates?: StoryGateSetting;
  /** Anything else the world should be built with, for a profile that turns a feature on. */
  world?: Partial<WorldOptions>;
}

/**
 * The world Normal plays in: every location the game has, each still holding its own item.
 * Key drops and the npc and world scopes are all on, because in the unmodified game those
 * places exist and hand over exactly what they always did.
 */
const normalWorldOptions = ({ storyGates, world }: NormalPlacementParams): WorldOptions => ({
  keyDropShuffle: true,
  includeNpcChecks: true,
  includeWorldItems: true,
  medallions: { ...ORIGINAL_MEDALLIONS },
  darkRooms: NORMAL_DARK_ROOMS,
  pondLocations: [],
  pondPrizeLocations: [],
  ...(storyGates === undefined ? {} : { storyGates }),
  ...world,
});

const buildNormalPlacement = (params: NormalPlacementParams = {}): Placement => {
  const options = normalWorldOptions(params);
  const world = buildWorld(options);
  const recorded = recordedContents();

  const locations: Record<LocationKey, ItemKey> = {};
  for (const region of world.regions.values()) {
    for (const location of region.locations) {
      const item = originalContentOf(world, recorded, location.key, region.id);
      if (item === undefined) throw new Error(`no original item recorded for location: ${location.key}`);
      locations[location.key] = item;
    }
  }
  // The sweep needs the items in place, because a rule may read the fill seam.
  for (const [key, item] of Object.entries(locations)) world.placedItems.set(key as LocationKey, item);
  const { spheres } = sweepPlacementSpheres(world);

  return {
    seed: NORMAL_SEED,
    medallions: { ...ORIGINAL_MEDALLIONS },
    locations,
    shopPrices: {},
    pondDemands: {},
    spheres,
    stats: normalPlacementStats({
      darkRooms: NORMAL_DARK_ROOMS,
      storyGates: params.storyGates,
      locationCount: Object.keys(locations).length,
      sphereCount: spheres.length,
    }),
  };
};

export { buildNormalPlacement, normalWorldOptions, ORIGINAL_MEDALLIONS };
export type { NormalPlacementParams };
