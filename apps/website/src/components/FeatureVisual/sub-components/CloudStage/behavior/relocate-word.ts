/* @layer website-site @kind logic */
import { RELOCATE_TRIES, TONE_COUNT } from '../CloudStage.constants';
import type { CloudFontRange, CloudPlacement, CloudRect, CloudSpot, CloudTriangle } from '../CloudStage.type';
import { collides } from './collides';
import { fitsIn } from './fits-in';

const spotFor = (moving: CloudPlacement, others: readonly CloudRect[], triangles: readonly CloudTriangle[], range: CloudFontRange): CloudSpot | null => {
  for (let attempt = 0; attempt < RELOCATE_TRIES; attempt += 1) {
    const triangle = triangles[Math.floor(Math.random() * triangles.length)];
    if (!triangle) return null;
    const ceiling = range.max - ((range.max - range.min) * attempt) / RELOCATE_TRIES;
    const fontPx = range.min + Math.random() * (ceiling - range.min);
    const width = moving.ratio.width * fontPx;
    const height = moving.ratio.height * fontPx;
    const rect = {
      left: triangle.centerX - triangle.half + Math.random() * Math.max(triangle.half * 2 - width, 0),
      top: triangle.top + Math.random() * Math.max(triangle.height - height, 0),
      width,
      height,
    };
    if (fitsIn(triangle, rect) && !collides(rect, others)) return { rect, fontPx };
  }
  return null;
};

const relocateWord = (placements: readonly CloudPlacement[], word: string, triangles: readonly CloudTriangle[], range: CloudFontRange): CloudPlacement[] => {
  const moving = placements.find((placement) => placement.word === word);
  if (!moving) return [...placements];
  const others = placements.filter((placement) => placement.word !== word).map((placement) => placement.rect);
  const spot = spotFor(moving, others, triangles, range);
  const tone = Math.floor(Math.random() * TONE_COUNT);

  return spot ? placements.map((placement) => (placement.word === word ? { ...placement, ...spot, tone } : placement)) : [...placements];
};

export { relocateWord };
