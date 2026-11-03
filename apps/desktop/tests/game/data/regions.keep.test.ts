/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { all, getRegion, getScreen } from '@rotp/game-data';
import type { ScreenId } from '@rotp/game-data';
import { describeDataset } from '../../dataset-guard';

describe('the region collection', () => {
  it('names a dungeon on every wing, and on no other region', { tags: ['standard'] }, () => {
    const wrong = all('region')
      .filter((region) => (region.type === 'dungeon') !== (region.dungeonId !== undefined))
      .map((region) => `${region.id} ${region.name}`);
    expect(wrong).toEqual([]);
  });
});

describeDataset('a cave region', () => {
  it('gives every cave region screens of one area', { tags: ['standard'] }, () => {
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
});

describeDataset('a wing and its dungeon agree', () => {
  it('gives a dungeon room a wing of that same dungeon', { tags: ['standard'] }, () => {
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

  it('gives a wing nothing but rooms of its own dungeon', { tags: ['standard'] }, () => {
    const roomsOf = new Map<string, Set<string>>(all('dungeon').map((dungeon) => [dungeon.id, new Set<string>(dungeon.roomScreenIds)]));
    const wrong = all('screen')
      .filter((screen) => screen.regionId !== undefined)
      .filter((screen) => getRegion(screen.regionId as string).dungeonId !== undefined)
      .filter((screen) => !roomsOf.get(getRegion(screen.regionId as string).dungeonId as string)?.has(screen.id))
      .map((screen) => `${screen.id} -> ${screen.regionId}`);
    expect(wrong).toEqual([]);
  });
});
