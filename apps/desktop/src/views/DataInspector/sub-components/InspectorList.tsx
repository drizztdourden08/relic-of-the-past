/* @layer renderer-app @kind component */
import { useMemo } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { DataTable, FilterBar } from '@drizztdourden08/tessera/composites';
import { NO_FINDINGS, NOTHING_MATCHES } from '../DataInspector.constants';
import type { InspectorListProps } from '../DataInspector.type';
import { buildDefaultColumns } from '../behavior/default-table-columns';
import { isEntityKind } from '../behavior/is-entity-kind';
import { tableViewKey } from '../behavior/table-view-key';
import { useTableOrder } from '../behavior/useTableOrder';
import { useWindowedRows } from '../behavior/useWindowedRows';
import { resolveIdRefDisplayValue, resolveIdRefTargetFields } from '@app/data-inspector/id-ref-display';
import { defaultIdRefDisplay } from '@app/data-inspector/record-links';
import { RECOMMENDATION_GROUP_BY } from '@app/data-inspector/recommendations/recommendation-source';
import { CreateRecordButton } from './CreateRecordButton';
import { ListLoading } from './ListLoading';
import { RowWindowBar } from './RowWindowBar';

const InspectorList = (props: InspectorListProps) => {
  const {
    kind, loading, source, schema, rows, clauses, onClausesChange, search, onSearchChange, selectedId, onSelect,
  } = props;
  const isCollection = isEntityKind(kind);
  const { order, storage } = useTableOrder(kind);
  const rowWindow = useWindowedRows({ rows, schema, order, selectedId, getId: source.getId, enabled: isCollection });

  const defaultColumns = useMemo(
    () => (source.config?.defaultColumns ? buildDefaultColumns(source.config.defaultColumns, schema) : undefined),
    [source, schema],
  );

  return (
    <>
      <Box className="data-inspector__list-actions">
        <FilterBar
          className="data-inspector__filter"
          schema={schema}
          clauses={clauses}
          onChange={onClausesChange}
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search records..."
          searchLabel="Search records"
        />
        {isCollection && !loading && (
          <CreateRecordButton kind={kind} label={source.label} schema={schema} onCreated={onSelect} />
        )}
      </Box>
      {loading ? <ListLoading label={`Loading ${source.label}...`} /> : (
        <>
          <DataTable
            rows={rowWindow.shown}
            schema={schema}
            getRowId={source.getId}
            viewKey={tableViewKey(kind)}
            viewStorage={isCollection ? storage : undefined}
            fallbackColumns={defaultColumns}
            fallbackGroupBy={isCollection ? undefined : RECOMMENDATION_GROUP_BY}
            selectedId={selectedId}
            onSelect={onSelect}
            emptyMessage={isCollection ? NOTHING_MATCHES : NO_FINDINGS}
            resolveTargetFields={resolveIdRefTargetFields}
            resolveIdRefDisplay={resolveIdRefDisplayValue}
            resolveIdRefDefault={defaultIdRefDisplay}
          />
          <RowWindowBar
            shown={rowWindow.shown.length}
            total={rowWindow.total}
            onShowMore={rowWindow.showMore}
            onShowAll={rowWindow.showAll}
          />
        </>
      )}
    </>
  );
};

export { InspectorList };
