/* @layer shared-game @kind logic */
/**
 * Renders a placement's spoiler spheres as readable text. Names come from the
 * dataset's randomizerName fields at runtime by default; both resolvers can be
 * overridden (e.g. for the standard name view).
 */
import { getCheck, getItem } from '@shared/game/data';
import type { CheckId, ItemId } from '@shared/game/data';
import type { Placement } from './placement.type';

type NameResolver = (id: string) => string;

const defaultCheckName: NameResolver = (id) => getCheck(id as CheckId).randomizerName;
const defaultItemName: NameResolver = (id) => getItem(id as ItemId).randomizerName;

const renderSpoilerText = (
  placement: Placement,
  resolveCheckName: NameResolver = defaultCheckName,
  resolveItemName: NameResolver = defaultItemName,
): string => {
  const lines: string[] = [`seed: ${placement.seed}`, `checks: ${Object.keys(placement.assignments).length}`];
  for (const sphere of placement.spoiler) {
    lines.push('', `sphere ${sphere.index}:`);
    for (const { checkId, itemId } of sphere.entries) {
      lines.push(`  ${resolveCheckName(checkId)}: ${resolveItemName(itemId)}`);
    }
  }
  return lines.join('\n');
};

export { renderSpoilerText };
export type { NameResolver };
