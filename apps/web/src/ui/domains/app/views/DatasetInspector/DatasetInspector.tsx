/* @layer renderer-app @kind component */
/**
 * Debug screen listing every entity of every kind in the game dataset —
 * per-kind columns and filters, plus id-to-id navigation across the
 * screen/connection/check/item/dungeon/area/location/actor relationship
 * graph — so the dataset migration and naming reassessment can be checked
 * by eye, and any record can be explored from any other.
 */
import { useMemo } from 'react';
import type { EntityKind } from '@shared/game/data';
import { Box, Select, TextInput } from '@ds/primitives';
import { ENTITY_KIND_OPTIONS } from './DatasetInspector.type';
import { useDatasetSearch } from './behavior/useDatasetSearch';
import { EntityTable } from './sub-components/EntityTable';
import { EntityDetail } from './sub-components/EntityDetail';
import './DatasetInspector.css';

const DatasetInspector = () => {
  const {
    kind, setKind, query, setQuery, facet, facetValue, setFacetValue,
    results, selectedId, setSelectedId, selected, resolveLabel, onNavigate,
  } = useDatasetSearch();

  const facetOptions = useMemo(
    () => (facet ? [{ value: '', label: `All ${facet.label.toLowerCase()}` }, ...facet.options] : []),
    [facet],
  );

  return (
    <Box className="dataset-inspector">
      <Box className="dataset-inspector__toolbar">
        <Select value={kind} onChange={v => setKind(v as EntityKind)} options={ENTITY_KIND_OPTIONS} size="sm" />
        {facet && (
          <Select
            value={facetValue}
            onChange={setFacetValue}
            options={facetOptions}
            size="sm"
            className="dataset-inspector__facet"
          />
        )}
        <TextInput
          className="dataset-inspector__search"
          placeholder="Filter…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </Box>
      <Box className="dataset-inspector__body">
        <EntityTable
          kind={kind}
          results={results}
          selectedId={selectedId}
          onSelect={setSelectedId}
          resolveLabel={resolveLabel}
          onNavigate={onNavigate}
        />
        <EntityDetail kind={kind} selected={selected} resolveLabel={resolveLabel} onNavigate={onNavigate} />
      </Box>
    </Box>
  );
};

export { DatasetInspector };
