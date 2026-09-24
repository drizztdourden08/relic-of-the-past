/* @layer renderer-hud @kind logic */
/**
 * Places the scene's pieces for a canvas width: a few mountains with real gaps between them, a
 * closed row of trees on the water line, and clouds at many heights. Deterministic for a seed.
 */
import type { Drifting, Placed, SceneAssets, SceneGeometry, SceneLayout } from './scene.type';
import { seededRandom } from './seeded-random';

const TREE_STEP = 16;
const TREE_ROWS = 12;
/** Mountains stand behind the trees, their flat base this far above the water line. */
const MOUNTAIN_LIFT = 8;
const MOUNTAIN_GAP = { min: 120, max: 320 } as const;
const MOUNTAIN_PAIR_CHANCE = 0.35;
const MOUNTAIN_OVERLAP = { min: 24, max: 44 } as const;
const CLOUD_EVERY = 72;
const CLOUD_SPEED = { min: 0.4, max: 1.1 } as const;

const buildSceneLayout = (geometry: SceneGeometry, assets: SceneAssets, seed: number): SceneLayout => {
  const { width, height, frameY, horizonY } = geometry;
  const rng = seededRandom(seed);

  const mountains: Placed[] = [];
  let x = rng.range(-40, 60);
  while (x < width + 40) {
    const variant = rng.int(0, assets.mountains.length - 1);
    const h = assets.mountains[variant].height;
    const y = horizonY - MOUNTAIN_LIFT - h + rng.int(0, 2);
    mountains.push({ x: Math.round(x), y, variant, flip: rng.chance(0.5) });
    if (rng.chance(MOUNTAIN_PAIR_CHANCE)) {
      const w = assets.mountains[variant].width;
      const pairVariant = rng.int(0, assets.mountains.length - 1);
      mountains.push({ x: Math.round(x + w - rng.range(MOUNTAIN_OVERLAP.min, MOUNTAIN_OVERLAP.max)), y: y + rng.int(0, 3), variant: pairVariant, flip: rng.chance(0.5) });
      x += w;
    }
    x += rng.range(MOUNTAIN_GAP.min, MOUNTAIN_GAP.max);
  }

  // One tree every 16 columns from past the left edge, so the row never opens, however far it drifts.
  // All on the same row: a tree lifted a pixel leaves a sliver of sky on the water line.
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

export { buildSceneLayout, TREE_ROWS };
