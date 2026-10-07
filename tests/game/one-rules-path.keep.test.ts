/* @layer tests @kind test */
/**
 * The successor to resolver.keep.test.ts, which guarded a second reachability graph and a second
 * table of location rules. Both are gone: the generator answers where a row is reachable, and what
 * is left on this side is the join from its regions to dataset screens, plus the two inputs the
 * file's own settings hand the rows read from the records.
 *
 * Each case below is the claim the retired test made, restated against the surface that now
 * carries it, so nothing it caught can slip through unseen.
 */
import { describe, expect, it } from 'vitest';
import { all, getDungeon, ITEM_GROUP_IDS } from '@shared/game/data';
import { standardNameOfCheck } from '@shared/game/data/check-standard-name';
import { screensOfRegions } from '@shared/game/logic/regions/reachable-screens';
import { buildNormalPlacement } from '@shared/randomizer/normal-placement';
import { grantedInventory, recordRowOverrides } from '@app/lib/game/tracker/record-row-inputs';
import type { ItemId } from '@shared/game/data';
import { describeDataset } from '../dataset-guard';

const LAMP: ItemId = 'item-019';
const FIRE_ROD: ItemId = 'item-008';
const EASTERN_BIG_KEY: ItemId = 'item-094';
/** Light World, and the screen the graph used to reach it by. */
const LIGHT_WORLD = 'screen-026';
/** The region records the claims below read off, by id, as the engine now answers. */
const LIGHT_WORLD_REGION = 'region-002';
const EASTERN_PALACE_REGION = 'region-168';
const MENU_REGION = 'region-001';

const normal = (): ReturnType<typeof buildNormalPlacement> =>
  buildNormalPlacement({ standardNameOf: (checkId) => {
    const check = all('check').find((row) => row.id === checkId);
    if (check === undefined) throw new Error(`no check record: ${checkId}`);
    return standardNameOfCheck(check);
  } });

describeDataset('regions to screens', () => {
  it('brings every real screen inside a region the engine reached', () => {
    const screens = screensOfRegions([LIGHT_WORLD_REGION]);
    expect(screens.has(LIGHT_WORLD)).toBe(true);
    const members = all('screen').filter((screen) => screen.regionId === LIGHT_WORLD_REGION);
    expect(members.length).toBeGreaterThan(1);
    for (const member of members) expect(screens.has(member.id)).toBe(true);
  });

  it('brings a dungeon whole once one of its rooms is reached', () => {
    const screens = screensOfRegions([EASTERN_PALACE_REGION]);
    const rooms = getDungeon('dungeon-003').roomScreenIds;
    expect(rooms.length).toBeGreaterThan(1);
    for (const room of rooms) expect(screens.has(room)).toBe(true);
  });

  it('says nothing about a region no screen carries', () => {
    expect([...screensOfRegions([MENU_REGION])]).toEqual([]);
  });
});

describeDataset('what the settings hand the record-read rows', () => {
  it('reads every Big Key door as open by handing the keys over', () => {
    const placement = normal();
    const shut = grantedInventory({ placement, inventory: new Set(), darkRoomsNeedLight: true, bigKeyDoors: true });
    const open = grantedInventory({ placement, inventory: new Set(), darkRoomsNeedLight: true, bigKeyDoors: false });
    expect(shut.has(EASTERN_BIG_KEY)).toBe(false);
    expect(open.has(EASTERN_BIG_KEY)).toBe(true);
    // Only the keys: the switch hands over nothing else.
    expect(open.has(LAMP)).toBe(false);
  });

  it('reads an unlit room as lit only when the file says the player can see', () => {
    const placement = normal();
    const blind = grantedInventory({ placement, inventory: new Set(), darkRoomsNeedLight: true, bigKeyDoors: true });
    expect(blind.has(LAMP)).toBe(false);
    const switchedOff = grantedInventory({ placement, inventory: new Set(), darkRoomsNeedLight: false, bigKeyDoors: true });
    expect(switchedOff.has(LAMP)).toBe(true);
    // Normal counts the lamp alone, so another light is not a light here.
    const withFireRod = grantedInventory({
      placement, inventory: new Set([FIRE_ROD]), darkRoomsNeedLight: true, bigKeyDoors: true,
    });
    expect(withFireRod.has(LAMP)).toBe(false);
  });

  it('asks each medallion entrance for the medallion the placement recorded', () => {
    const overrides = recordRowOverrides(normal());
    expect(JSON.stringify(overrides['check-344'])).toContain('item-017'); // Ether, the mire
    expect(JSON.stringify(overrides['check-345'])).toContain('item-018'); // Quake, Turtle Rock
  });

  it('asks the pedestal for the three pendants the unmodified game asks for', () => {
    const overrides = recordRowOverrides(normal());
    expect(overrides['check-312']).toEqual({ count: { groupId: ITEM_GROUP_IDS.Pendants, n: 3 } });
  });
});
