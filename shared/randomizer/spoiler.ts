/* @layer shared-game @kind logic */
/**
 * Renders a Placement's spoiler as readable text: the seed line, the two
 * rolled medallions, then the verification sweep's spheres with each location's assigned item.
 * A placement holds ids, so every name here is read off the record at print time.
 */
import { itemKeyName } from './world/display-names/item-key-name';
import { locationDisplayName } from './world/display-names/location-display-name';
import type { Placement } from './world/fill/placement.type';

const renderSpoilerText = (placement: Placement): string => {
  const { seed, medallions, locations, spheres } = placement;
  const lines: string[] = [
    `seed: ${seed}`,
    `locations: ${Object.keys(locations).length}`,
    `medallions: mire ${itemKeyName(medallions.mire)} / turtle rock ${itemKeyName(medallions.turtleRock)}`,
  ];
  for (const sphere of spheres) {
    lines.push('', `sphere ${sphere.index}:`);
    for (const location of sphere.locations) {
      const item = locations[location];
      lines.push(`  ${locationDisplayName(location)}: ${item === undefined ? '(nothing)' : itemKeyName(item)}`);
    }
  }
  return lines.join('\n');
};

export { renderSpoilerText };
