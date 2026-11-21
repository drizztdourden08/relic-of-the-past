/* @layer renderer-app @kind component */
import { useMemo } from 'react';
import { useT, useText } from '@drizztdourden08/brock-react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { DataTable, FilterBar } from '@drizztdourden08/tessera/composites';
import { KIND_LABELS, KIND_SINGULARS, NO_FINDINGS, NOTHING_MATCHES } from '../DataInspector.constants';
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
  const t = useT();
  const text = useText();
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
          searchPlaceholder={t('views-data-inspector:list.search.placeholder')}
          searchLabel={t('views-data-inspector:list.search.label')}
        />
        {isCollection && !loading && (
          <CreateRecordButton kind={kind} label={text(KIND_SINGULARS[kind] ?? kind)} schema={schema} onCreated={onSelect} />
        )}
      </Box>
      {loading ? <ListLoading label={t('views-data-inspector:list.loading', { label: text(KIND_LABELS[kind] ?? kind) })} /> : (
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
            emptyMessage={text(isCollection ? NOTHING_MATCHES : NO_FINDINGS)}
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
