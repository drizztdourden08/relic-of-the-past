/* @layer shared-game @kind logic */
import { all, tagsFor } from '../../../data';
import type { CheckFacetDef } from './check-grouping.type';

const areaFacets = (): CheckFacetDef[] =>
  all('area').flatMap((area): CheckFacetDef[] => area.world === 'both'
    ? [
        { id: `area:${area.id}:light`, label: area.name, category: 'area' },
        { id: `area:${area.id}:dark`, label: `Dark ${area.name}`, category: 'area' },
      ]
    : [{ id: `area:${area.id}`, label: area.name, category: 'area' }]);

const contentFacets = (): CheckFacetDef[] =>
  tagsFor('check').map(tag => ({ id: tag.name, label: tag.label, category: 'content' as const }));

const facetCatalog = (worldFacets: CheckFacetDef[], locationFacets: CheckFacetDef[]): CheckFacetDef[] =>
  [...worldFacets, ...locationFacets, ...areaFacets(), ...contentFacets()];

export { facetCatalog };
