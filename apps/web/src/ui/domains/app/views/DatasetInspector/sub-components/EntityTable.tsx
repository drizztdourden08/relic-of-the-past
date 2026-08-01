/* @layer renderer-app @kind component */
import type { CSSProperties } from 'react';
import type { EntityKind } from '@shared/game/data';
import { Box, Text } from '@ds/primitives';
import { getColumnsForKind } from './columns';
import type { DatasetSearchResult } from '../DatasetInspector.type';

interface EntityTableProps {
  kind: EntityKind;
  results: DatasetSearchResult[];
  selectedId?: string;
  onSelect: (id: string) => void;
  resolveLabel: (id?: string) => string;
  onNavigate: (id: string) => void;
}

const EntityTable = (props: EntityTableProps) => {
  const { kind, results, selectedId, onSelect, resolveLabel, onNavigate } = props;
  const columns = getColumnsForKind(kind);
  const ctx = { resolveLabel, onNavigate };
  // The column set changes per kind, so its track sizes are computed here rather than fixed in CSS.
  const gridStyle: CSSProperties = { gridTemplateColumns: columns.map(c => c.width).join(' ') };

  return (
    <Box className="dataset-inspector__table">
      <Box className="dataset-inspector__header-row" style={gridStyle}>
        {columns.map(c => (
          <Text key={c.key} variant="label" className="dataset-inspector__cell">{c.header}</Text>
        ))}
      </Box>
      {results.map(r => (
        <Box
          key={r.id}
          className={`dataset-inspector__row ${r.id === selectedId ? 'dataset-inspector__row--active' : ''}`}
          style={gridStyle}
          onClick={() => onSelect(r.id)}
        >
          {columns.map(c => (
            <Box key={c.key} className="dataset-inspector__cell">{c.render(r.raw, ctx)}</Box>
          ))}
        </Box>
      ))}
      {results.length === 0 && <Text className="dataset-inspector__empty">No entities match.</Text>}
    </Box>
  );
};

export { EntityTable };
