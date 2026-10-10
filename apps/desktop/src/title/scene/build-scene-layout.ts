/* @layer renderer-hud @kind logic */
import type { Drifting, Placed, SceneAssets, SceneGeometry, SceneLayout } from './scene.type';
import { seededRandom } from './seeded-random';
import { itemAt } from '@app/checked-access';
import {
  CLOUD_EVERY, CLOUD_SPEED, MOUNTAIN_GAP, MOUNTAIN_LIFT_ABOVE_WATER, MOUNTAIN_OVERLAP, MOUNTAIN_PAIR_CHANCE, TREE_ROWS, TREE_STEP,
} from './scene.constants';

const buildSceneLayout = (geometry: SceneGeometry, assets: SceneAssets, seed: number): SceneLayout => {
  const { width, frameY, horizonY } = geometry;
  const rng = seededRandom(seed);

  const mountains: Placed[] = [];
  let x = rng.range(-40, 60);
  while (x < width + 40) {
    const variant = rng.int(0, assets.mountains.length - 1);
    const mountain = itemAt(assets.mountains, variant);
    const h = mountain.height;
    const y = horizonY - MOUNTAIN_LIFT_ABOVE_WATER - h + rng.int(0, 2);
    mountains.push({ x: Math.round(x), y, variant, flip: rng.chance(0.5) });
    if (rng.chance(MOUNTAIN_PAIR_CHANCE)) {
      const w = mountain.width;
      const pairVariant = rng.int(0, assets.mountains.length - 1);
      mountains.push({ x: Math.round(x + w - rng.range(MOUNTAIN_OVERLAP.min, MOUNTAIN_OVERLAP.max)), y: y + rng.int(0, 3), variant: pairVariant, flip: rng.chance(0.5) });
      x += w;
    }
    x += rng.range(MOUNTAIN_GAP.min, MOUNTAIN_GAP.max);
  }

  const trees: Placed[] = [];
  for (let tx = -TREE_STEP; tx < width + TREE_STEP * 2; tx += TREE_STEP) {
    trees.push({ x: tx, y: horizonY - TREE_ROWS, variant: rng.int(0, assets.trees.length - 1), flip: rng.chance(0.5) });
  }

  const clouds: Drifting[] = [];
  const cloudTop = frameY + 6;
  const cloudBottom = horizonY - 44;
  for (let i = 0, n = Math.max(2, Math.round(width / CLOUD_EVERY)); i < n; i++) {
    clouds.push({
      x: rng.range(0, width), y: Math.round(rng.range(cloudTop, cloudBottom)),
      variant: rng.int(0, assets.clouds.length - 1), flip: rng.chance(0.5), speed: rng.range(CLOUD_SPEED.min, CLOUD_SPEED.max),
    });
  }

  return { mountains, trees, clouds };
};

export { buildSceneLayout };
