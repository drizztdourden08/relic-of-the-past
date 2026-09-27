/* @layer shared-game @kind logic */
/**
 * World-zone marking: port of mark_light_world_regions from
 * Archipelago worlds/alttp/Regions.py. Two rule-free sweeps: one from every
 * first-world overworld region that refuses to enter second-world overworld
 * regions (setting isLightWorld), and the mirror sweep for isDarkWorld.
 * Cross-world interiors may end up marked as both, and the transform-suppression
 * logic in the helpers handles that case, per the python comment.
 */
import type { RegionId } from '@shared/game/data/types/ids';
import type { Region } from './region.type';

const sweep = (
  regions: ReadonlyMap<RegionId, Region>,
  seedType: 'light' | 'dark',
  blockedType: 'light' | 'dark',
  mark: (region: Region) => void,
): void => {
  const queue: Region[] = [...regions.values()].filter((region) => region.type === seedType);
  const seen = new Set<Region>(queue);
  while (queue.length > 0) {
    const current = queue.shift() as Region;
    mark(current);
    for (const exit of current.exits) {
      const target = regions.get(exit.target);
      if (target === undefined || target.type === blockedType) continue;
      if (!seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
};

const markWorldZones = (regions: ReadonlyMap<RegionId, Region>): void => {
  sweep(regions, 'light', 'dark', (region) => {
    region.isLightWorld = true;
  });
  sweep(regions, 'dark', 'light', (region) => {
    region.isDarkWorld = true;
  });
};

export { markWorldZones };
