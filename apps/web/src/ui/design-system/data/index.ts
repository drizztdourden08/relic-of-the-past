/* @layer renderer-components @kind barrel */
export { buildSchema, createSchemaIndex, toSchemaIndex } from './schema/build-schema';
export type { SchemaIndex, SchemaLike } from './schema/build-schema';
export { MAX_DEPTH, deriveSchema, labelFor } from './schema/derive-fields';
export type {
  CollectionSource, FieldDescriptor, FieldGroup, FieldKind, SchemaConfig,
} from './schema/field-descriptor';
export { ENUM_MAX, ID_RE, enumOptions, idTargetKind, inferKind } from './schema/infer-kind';
export { getPath, setPath } from './schema/path';

export { compile, createClause } from './filter/clause';
export type { FilterClause, RowPredicate } from './filter/clause';
export {
  OPERATORS_BY_KIND, defaultOperatorFor, findOperator, isOperatorValid, operatorsFor,
} from './filter/operators';
export type { OperatorIcon, OperatorSpec } from './filter/operators';
export {
  clearFieldTesters, getFieldTester, hasFieldTester, registerFieldTester,
} from './filter/tester-registry';
export type { FieldTester, FilterTestOptions } from './filter/tester-registry';

export {
  addColumn, fitAllColumns, fitColumn, indexOfColumn, insertColumnAt, moveColumn, removeColumn,
  renameColumn, reorderColumn, resizeColumn, setDisplayField,
} from './table/column-ops';
export { deriveRows, effectiveSort } from './table/derive-rows';
export { flattenGroups, groupRows } from './table/group-rows';
export type { GroupKeyFor } from './table/group-rows';
export { findSort, removeSort, setSingleSort, setSortDir, sortRows } from './table/sort-ops';
export {
  clearFieldStrategies, fallbackComparator, fallbackGroupKey,
  getComparator, getGroupKey, registerComparator, registerGroupKey,
} from './table/strategy-registry';
export type { Comparator, GroupKeyFn } from './table/strategy-registry';
export type { ColumnMove, GroupedRow, SortEntry, TableColumn, TableState } from './table/types';
export { defaultColumns, initialState, useDataTable } from './table/use-data-table';
export type { DataTableState, UseDataTableInput } from './table/use-data-table';

export { prune } from './view-state/prune';
export {
  SNAPSHOT_VERSION, capture, emptySnapshot, isViewSnapshot, restore,
} from './view-state/snapshot';
export type {
  DetailTab, RestoredView, ViewKey, ViewSnapshot, ViewStore,
} from './view-state/snapshot';
export { useViewState } from './view-state/use-view-state';
