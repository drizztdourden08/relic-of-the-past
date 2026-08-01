/* @layer renderer-app @kind logic */
import { useCallback, useMemo, useState } from 'react';
import { find } from '@shared/game/data';
import type { EntityKind } from '@shared/game/data';
import { FACETS } from '../DatasetInspector.constants';
import type { DatasetSearchResult } from '../DatasetInspector.type';
import { entityKindFromId, resolveRecordLabel } from './record-links';

const matchesQuery = (record: Record<string, unknown>, query: string): boolean => {
  if (!query) return true;
  return JSON.stringify(record).toLowerCase().includes(query.toLowerCase());
};

const useDatasetSearch = () => {
  const [kind, setKindState] = useState<EntityKind>('screen');
  const [query, setQuery] = useState('');
  const [facetValue, setFacetValue] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const facet = FACETS[kind];

  const setKind = useCallback((next: EntityKind) => {
    setKindState(next);
    setFacetValue('');
    setSelectedId(undefined);
  }, []);

  const results = useMemo<DatasetSearchResult[]>(() => {
    const records = find(kind, record => {
      const raw = record as unknown as Record<string, unknown>;
      if (!matchesQuery(raw, query)) return false;
      if (facet && facetValue && raw[facet.field] !== facetValue) return false;
      return true;
    });
    return (records as unknown as Record<string, unknown>[]).map(raw => ({ id: String(raw.id), raw }));
  }, [kind, query, facet, facetValue]);

  const selected = results.find(r => r.id === selectedId);

  const resolveLabel = useCallback((id?: string): string => (id ? resolveRecordLabel(id) : '—'), []);

  /** Jumps the whole inspector to whatever kind the id belongs to and selects it — the graph is one click away. */
  const onNavigate = useCallback((id: string) => {
    const targetKind = entityKindFromId(id);
    if (!targetKind) return;
    setKindState(targetKind);
    setFacetValue('');
    setSelectedId(id);
  }, []);

  return {
    kind, setKind, query, setQuery, facet, facetValue, setFacetValue,
    results, selectedId, setSelectedId, selected, resolveLabel, onNavigate,
  };
};

export { useDatasetSearch };
