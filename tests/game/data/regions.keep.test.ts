/* @layer tests @kind test */
/**
 * The region collection, and the pointer every screen carries up at it.
 *
 * Neither tree-layout nor rom-facts can hold these: the first only asks where a record file
 * sits, and the second only holds a `gameId` number against the cartridge. What is left is the
 * third partition itself. A region says what a player can walk without asking for anything, so
 * the claims here are about agreement between a screen and the region it points at, never about
 * geography.
 *
 * The two lists of exceptions are the work step 7 left undone, named one by one. Shortening
 * them is progress; lengthening one means a record got worse.
 */
import { describe, expect, it } from 'vitest';
import { all, getRegion, getScreen } from '@shared/game/data';
import type { RegionId, ScreenId } from '@shared/game/data/types';
import { describeDataset } from '../../dataset-guard';

/** One row per region of the reference generator's four taxonomies, in their own order. */
const REGION_COUNT = 239;
/** The 11 boxes of `kAreaBoxEvents`, and the 15 heads of `kAreaHeadEvents` a region stands for. */
const BOUNDED = 11;
const HEADED = 15;

/**
 * The screens no region owns, outside a dungeon.
 *
 * Each is a screen the dataset holds and the reference has no region for: a second reading of a
 * place it holds once (the rain, the light-world side of the pyramid ledge, the spot the desert
 * palace east door stands on), or the graph's own root, which is a place in the rules and nowhere
 * in the game.
 */
const NO_REGION_OUTSIDE_A_DUNGEON: readonly ScreenId[] = [
  'screen-012', 'screen-027', 'screen-038', 'screen-039',
];

/**
 * The wings no screen points at yet.
 *
 * Every one is a wing the reference splits out of a room the dataset holds whole, or a corridor
 * wing whose own locations are empty, so no check names a room for it and the dungeon connection
 * records carry no gate to divide it by. These are the rows the inspector pass settles by hand.
 */
/**
 * The dungeon rooms no wing owns, after the door table had its say.
 *
 * A wing of the reference ends at a locked door, a bombable wall, a curtain or a one-way drop,
 * and `rom-room-doors.ts` reads every one of those out of the cartridge, so a flood from the
 * rooms a wing's own checks name settles most of them. What is left is a room two wings both
 * reach because the boundary between them is inside a room the dataset holds whole, or a room
 * whose only record is a staircase neither room header carries. Shortening this list is
 * progress; lengthening it means a room lost a region it had.
 */
const ROOMS_NO_WING_OWNS: readonly ScreenId[] = [
  'screen-108', 'screen-318', 'screen-322', 'screen-323', 'screen-332', 'screen-335',
  'screen-337', 'screen-339', 'screen-340', 'screen-353', 'screen-354', 'screen-361',
  'screen-363', 'screen-364', 'screen-367', 'screen-374', 'screen-375', 'screen-376',
  'screen-385', 'screen-386', 'screen-387', 'screen-398', 'screen-403', 'screen-404',
  'screen-408', 'screen-417', 'screen-418', 'screen-426', 'screen-427', 'screen-430',
  'screen-439', 'screen-445',
];

const WINGS_WITH_NO_SCREEN: readonly RegionId[] = [
  'region-001', 'region-065', 'region-172', 'region-178', 'region-181', 'region-192',
  'region-193', 'region-206', 'region-210', 'region-213', 'region-216', 'region-217',
  'region-226', 'region-232', 'region-236', 'region-238',
];

const regionIds = (): readonly string[] => all('region').map((region) => region.id).sort();

describe('the region collection', () => {
  it('holds one region per reference row, at a dense run of ids', () => {
    const wanted = Array.from({ length: REGION_COUNT }, (_, i) => `region-${String(i + 1).padStart(3, '0')}`);
    expect(regionIds()).toEqual(wanted);
  });

  it('carries the area table\'s heads and boxes, and nothing else', () => {
    const regions = all('region');
    expect(regions.filter((region) => region.headScreenId !== undefined)).toHaveLength(HEADED);
    expect(regions.filter((region) => region.bounds !== undefined)).toHaveLength(BOUNDED);
    const wrong = regions
      .flatMap((region) => [region.headScreenId, region.bounds?.screenId])
      .filter((id): id is ScreenId => id !== undefined)
      .filter((id) => getScreen(id).kind !== 'overworld');
    expect(wrong).toEqual([]);
  });

  it('names a dungeon on every wing, and on no other region', () => {
    const wrong = all('region')
      .filter((region) => (region.type === 'dungeon') !== (region.dungeonId !== undefined))
      .map((region) => `${region.id} ${region.name}`);
    expect(wrong).toEqual([]);
  });
});

describeDataset('every screen points up at a region of its own world', () => {
  it('points at a region that exists', () => {
    const ids = new Set(regionIds());
    const wrong = all('screen')
      .filter((screen) => screen.regionId !== undefined && !ids.has(screen.regionId))
      .map((screen) => `${screen.id} -> ${screen.regionId}`);
    expect(wrong).toEqual([]);
  });

  it('points at a region of its own world', () => {
    const wrong = all('screen')
      .filter((screen) => screen.regionId !== undefined)
      .filter((screen) => getRegion(screen.regionId as string).world !== screen.world)
      .map((screen) => `${screen.id} ${screen.world} -> ${screen.regionId} ${getRegion(screen.regionId as string).world}`);
    expect(wrong).toEqual([]);
  });

  /**
   * A cave is one place behind one set of doors, so the screens of a cave region cannot disagree
   * about which area they stand in. The three screens the world claim above used to except (189,
   * 198 and 254) were this same fault from the other side: one cave's readings in two worlds.
   * An overworld region is not held to it, because the light world is one region of 129 screens.
   */
  it('gives every cave region screens of one area', () => {
    const seen = new Map<string, { areaId: string; id: ScreenId }>();
    const wrong: string[] = [];
    for (const screen of all('screen')) {
      const regionId = screen.regionId;
      if (regionId === undefined || getRegion(regionId).type !== 'cave') continue;
      const first = seen.get(regionId);
      if (first === undefined) { seen.set(regionId, { areaId: screen.areaId, id: screen.id }); continue; }
      if (first.areaId !== screen.areaId) {
        wrong.push(`${regionId}: ${first.id} is in ${first.areaId}, ${screen.id} in ${screen.areaId}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('leaves a region unset only on a dungeon room or one of the named screens', () => {
    const rooms = new Set(all('dungeon').flatMap((dungeon) => dungeon.roomScreenIds));
    const unset = all('screen').filter((screen) => screen.regionId === undefined);
    const stray = unset
      .filter((screen) => !rooms.has(screen.id) && !NO_REGION_OUTSIDE_A_DUNGEON.includes(screen.id))
      .map((screen) => screen.id);
    expect(stray).toEqual([]);
    expect(unset.filter((screen) => !rooms.has(screen.id)).map((screen) => screen.id).sort())
      .toEqual([...NO_REGION_OUTSIDE_A_DUNGEON].sort());
  });

  it('leaves exactly the named dungeon rooms with no wing of their own', () => {
    const rooms = new Set(all('dungeon').flatMap((dungeon) => dungeon.roomScreenIds));
    const unset = all('screen')
      .filter((screen) => screen.regionId === undefined && rooms.has(screen.id))
      .map((screen) => screen.id)
      .sort();
    expect(unset).toEqual([...ROOMS_NO_WING_OWNS].sort());
  });
});

describeDataset('a screen, its area and its location agree', () => {
  it('sits at a location filed under its own area', () => {
    const areaOf = new Map(all('location').map((location) => [location.id, location.areaId]));
    const wrong = all('screen')
      .filter((screen) => areaOf.has(screen.locationId) && areaOf.get(screen.locationId) !== screen.areaId)
      .map((screen) => `${screen.id} ${screen.areaId} -> ${screen.locationId} of ${areaOf.get(screen.locationId)}`);
    expect(wrong).toEqual([]);
  });
});

describeDataset('a wing and its dungeon agree', () => {
  it('gives a dungeon room a wing of that same dungeon', () => {
    const wrong: string[] = [];
    for (const dungeon of all('dungeon')) {
      for (const room of dungeon.roomScreenIds) {
        const regionId = getScreen(room).regionId;
        if (regionId === undefined) continue;
        const wing = getRegion(regionId);
        if (wing.dungeonId !== dungeon.id) wrong.push(`${room} of ${dungeon.id} -> ${regionId} of ${wing.dungeonId}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('gives a wing nothing but rooms of its own dungeon', () => {
    const roomsOf = new Map(all('dungeon').map((dungeon) => [dungeon.id, new Set<string>(dungeon.roomScreenIds)]));
    const wrong = all('screen')
      .filter((screen) => screen.regionId !== undefined)
      .filter((screen) => getRegion(screen.regionId as string).dungeonId !== undefined)
      .filter((screen) => !roomsOf.get(getRegion(screen.regionId as string).dungeonId as string)?.has(screen.id))
      .map((screen) => `${screen.id} -> ${screen.regionId}`);
    expect(wrong).toEqual([]);
  });

  it('leaves exactly the named wings with no screen of their own', () => {
    const owned = new Set(all('screen').map((screen) => screen.regionId));
    const homeless = all('region').filter((region) => !owned.has(region.id)).map((region) => region.id).sort();
    expect(homeless).toEqual([...WINGS_WITH_NO_SCREEN].sort());
  });
});
