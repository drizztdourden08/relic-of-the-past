/* @layer shared-game @kind logic */
/**
 * Renders a v1 placement's spoiler spheres as readable text. Names come from
 * the dataset's name fields at runtime by default; both resolvers
 * can be overridden (e.g. for the standard name view). The engine's own
 * placement has its renderer in spoiler.ts.
 */
import { getCheck, getItem } from '@shared/game/data';
import type { CheckId, ItemId } from '@shared/game/data';
import type { LegacyPlacement } from './placement.type';

type NameResolver = (id: string) => string;

const defaultCheckName: NameResolver = (id) => getCheck(id as CheckId).name;
const defaultItemName: NameResolver = (id) => getItem(id as ItemId).name;

const renderLegacySpoilerText = (
  placement: LegacyPlacement,
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

export { renderLegacySpoilerText };
export type { NameResolver };
