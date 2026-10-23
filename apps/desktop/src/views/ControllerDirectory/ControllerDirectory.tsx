/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Callout, Stack } from '@drizztdourden08/tessera/primitives';
import { DataTable, FilterBar } from '@drizztdourden08/tessera/composites';
import { useControllerDirectory } from './behavior/useControllerDirectory';
import {
  COUNT_LABEL, DIRECTORY_COLUMNS, DIRECTORY_GROUP_BY, DIRECTORY_SCHEMA, EMPTY_MESSAGE, PARTIAL_NOTE, SEARCH_LABEL,
  SEARCH_PLACEHOLDER,
} from './ControllerDirectory.constants';
import type { ControllerDirectoryProps, DirectoryRow } from './ControllerDirectory.type';

const getRowId = (row: DirectoryRow): string => row.id;

const ControllerDirectory = (props: ControllerDirectoryProps) => {
  const { onOpenController } = props;
  const { rows, shown, complete, clauses, setClauses, search, setSearch } = useControllerDirectory();

  const handleSelect = useCallback((id: string) => {
    const key = rows.find((row) => row.id === id)?.connectedKey;
    if (key) onOpenController?.(key);
  }, [rows, onOpenController]);

  return (
    <Stack gap="md" align="stretch">
      {!complete && <Callout tone="info" variant="footnote">{PARTIAL_NOTE}</Callout>}
      <FilterBar
        schema={DIRECTORY_SCHEMA}
        clauses={clauses}
        onChange={setClauses}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={SEARCH_PLACEHOLDER}
        searchLabel={SEARCH_LABEL}
        fields={['family', 'source']}
      />
      <DataTable
        rows={shown}
        schema={DIRECTORY_SCHEMA}
        getRowId={getRowId}
        fallbackColumns={DIRECTORY_COLUMNS}
        fallbackGroupBy={DIRECTORY_GROUP_BY}
        onSelect={handleSelect}
        countLabel={COUNT_LABEL}
        emptyMessage={EMPTY_MESSAGE}
      />
    </Stack>
  );
};

export { ControllerDirectory };
