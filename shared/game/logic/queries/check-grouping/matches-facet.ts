/* @layer shared-game @kind logic */
import { getScreen, hasTagKey } from '../../../data';
import type { CheckRecord, ScreenRecord } from '../../../data';

const locationOf = (check: CheckRecord, screen: ScreenRecord | undefined): string => {
  if (check.dungeonId) return 'dungeon';
  if (screen?.interiorKind === 'cave') return 'cave';
  if (screen?.interiorKind === 'house') return 'house';
  return 'overworld';
};

const matchesFacet = (check: CheckRecord, facetId: string): boolean => {
  const screen = check.screenId ? getScreen(check.screenId) : undefined;
  if (facetId.startsWith('world:')) return facetId === `world:${screen?.world ?? 'light'}`;
  if (facetId.startsWith('location:')) return facetId === `location:${locationOf(check, screen)}`;
  if (facetId.startsWith('area:')) {
    if (!screen) return false;
    return facetId === `area:${screen.areaId}` || facetId === `area:${screen.areaId}:${screen.world}`;
  }
  return hasTagKey(check.tags ?? [], facetId);
};

export { matchesFacet };
