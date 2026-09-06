/* @layer shared-game @kind logic */
/**
 * World-zone marking — port of mark_light_world_regions from
 * tests/fixtures/ap-source/Regions.py. Two rule-free sweeps: one from every
 * first-world overworld region that refuses to enter second-world overworld
 * regions (setting isLightWorld), and the mirror sweep for isDarkWorld.
 * Cross-world interiors may end up marked as both — the transform-suppression
 * logic in the helpers handles that case, per the python comment.
 */
import type { ApRegion } from './region.type';

const sweep = (
  regions: ReadonlyMap<string, ApRegion>,
  seedType: 'light' | 'dark',
  blockedType: 'light' | 'dark',
  mark: (region: ApRegion) => void,
): void => {
  const queue: ApRegion[] = [...regions.values()].filter((region) => region.type === seedType);
  const seen = new Set<ApRegion>(queue);
  while (queue.length > 0) {
    const current = queue.shift() as ApRegion;
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

const markWorldZones = (regions: ReadonlyMap<string, ApRegion>): void => {
  sweep(regions, 'light', 'dark', (region) => {
    region.isLightWorld = true;
  });
  sweep(regions, 'dark', 'light', (region) => {
    region.isDarkWorld = true;
  });
};

export { markWorldZones };
