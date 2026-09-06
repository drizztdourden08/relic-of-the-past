/* @layer shared-game @kind logic */
/**
 * Renders an ApPlacement's spoiler as readable text: the seed line, the two
 * rolled medallions, then the verification sweep's spheres with each
 * location's assigned item looked up in the name view. Names are already the
 * community-standard strings, so no resolver is needed — the legacy
 * Placement shape keeps its own renderer in spoiler.ts.
 */
import type { ApPlacement } from './ap-world/fill/ap-placement.type';

const renderApSpoilerText = (placement: ApPlacement): string => {
  const { seed, medallions, nameView, spheres } = placement;
  const lines: string[] = [
    `seed: ${seed}`,
    `locations: ${Object.keys(nameView).length}`,
    `medallions: mire ${medallions.mire} / turtle rock ${medallions.turtleRock}`,
  ];
  for (const sphere of spheres) {
    lines.push('', `sphere ${sphere.index}:`);
    for (const location of sphere.locations) {
      lines.push(`  ${location}: ${nameView[location] ?? '(nothing)'}`);
    }
  }
  return lines.join('\n');
};

export { renderApSpoilerText };
