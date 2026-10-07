/* @layer shared-game @kind logic */
/**
 * Filter-chip catalog for the check filter UI's world/location/area/content
 * facets, and the predicate that tests one facet id against a check.
 *
 * World, location and area facets join directly against ScreenRecord /
 * AreaRecord instead of duplicating them as precomputed tags (the old
 * CheckTag families this replaced). Content facets read the real tags stored
 * on `CheckRecord.tags`. That family was never a pure duplicate, so it stays
 * a real tag reference, sourced here straight from the tag collection via
 * `tagsFor('check')` instead of a second hardcoded list.
 */
import { all, getScreen, hasTagKey, tagsFor } from '../../../data';
import type { CheckRecord, ScreenRecord } from '../../../data';

type CheckFacetCategory = 'world' | 'location' | 'area' | 'content';

interface CheckFacetDef {
  id: string;
  label: string;
  category: CheckFacetCategory;
}

const WORLD_FACETS: CheckFacetDef[] = [
  { id: 'world:light', label: 'Light World', category: 'world' },
  { id: 'world:dark', label: 'Dark World', category: 'world' },
];

const LOCATION_FACETS: CheckFacetDef[] = [
  { id: 'location:dungeon', label: 'Dungeon', category: 'location' },
  { id: 'location:cave', label: 'Cave', category: 'location' },
  { id: 'location:house', label: 'House', category: 'location' },
  { id: 'location:overworld', label: 'Overworld', category: 'location' },
];

/** Death Mountain spans both worlds, so it needs one facet per side; every other area is single-world. */
const areaFacets = (): CheckFacetDef[] =>
  all('area').flatMap((area): CheckFacetDef[] => area.world === 'both'
    ? [
        { id: `area:${area.id}:light`, label: area.randomizerName, category: 'area' },
        { id: `area:${area.id}:dark`, label: `Dark ${area.randomizerName}`, category: 'area' },
      ]
    : [{ id: `area:${area.id}`, label: area.randomizerName, category: 'area' }]);

const contentFacets = (): CheckFacetDef[] =>
  tagsFor('check').map(tag => ({ id: tag.name, label: tag.label, category: 'content' as const }));

const CHECK_FACET_DEFS: CheckFacetDef[] = [...WORLD_FACETS, ...LOCATION_FACETS, ...areaFacets(), ...contentFacets()];

/** Same cave/house/else-overworld rule the old computeCheckTags used, read straight off the screen. */
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

export { CHECK_FACET_DEFS, matchesFacet };
export type { CheckFacetCategory, CheckFacetDef };
