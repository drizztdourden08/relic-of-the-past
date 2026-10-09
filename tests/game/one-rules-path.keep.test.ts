/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { all, getDungeon, ITEM_GROUP_IDS } from '@rotp/game-data';
import { standardNameOfCheck } from '@rotp/game-data';
import { screensOfRegions } from '@rotp/game-data';
import { buildNormalPlacement } from '@rotp/randomizer';
import { grantedInventory, recordRowOverrides } from '@app/lib/game/tracker/record-row-inputs';
import type { ItemId } from '@rotp/game-data';
import { describeDataset } from '../dataset-guard';

const LAMP: ItemId = 'item-019';
const FIRE_ROD: ItemId = 'item-008';
const EASTERN_BIG_KEY: ItemId = 'item-094';
const ETHER: ItemId = 'item-017';
const QUAKE: ItemId = 'item-018';
const MIRE_MEDALLION_CHECK = 'check-344';
const TURTLE_ROCK_MEDALLION_CHECK = 'check-345';
const LIGHT_WORLD = 'screen-026';
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
    expect(open.has(LAMP)).toBe(false);
  });

  it('reads an unlit room as lit only when the file says the player can see', () => {
    const placement = normal();
    const blind = grantedInventory({ placement, inventory: new Set(), darkRoomsNeedLight: true, bigKeyDoors: true });
    expect(blind.has(LAMP)).toBe(false);
    const switchedOff = grantedInventory({ placement, inventory: new Set(), darkRoomsNeedLight: false, bigKeyDoors: true });
    expect(switchedOff.has(LAMP)).toBe(true);
    const withFireRod = grantedInventory({
      placement, inventory: new Set([FIRE_ROD]), darkRoomsNeedLight: true, bigKeyDoors: true,
    });
    expect(withFireRod.has(LAMP)).toBe(false);
  });

  it('asks each medallion entrance for the medallion the placement recorded', () => {
    const overrides = recordRowOverrides(normal());
    expect(JSON.stringify(overrides[MIRE_MEDALLION_CHECK])).toContain(ETHER);
    expect(JSON.stringify(overrides[TURTLE_ROCK_MEDALLION_CHECK])).toContain(QUAKE);
  });

  it('asks the pedestal for the three pendants the unmodified game asks for', () => {
    const overrides = recordRowOverrides(normal());
    expect(overrides['check-312']).toEqual({ count: { groupId: ITEM_GROUP_IDS.Pendants, n: 3 } });
  });
});
