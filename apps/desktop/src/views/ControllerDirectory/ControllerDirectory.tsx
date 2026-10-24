/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { PageActions } from '@drizztdourden08/brock-react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { DataTable, FilterBar } from '@drizztdourden08/tessera/composites';
import { RescanButton } from '@app/compounds/RescanButton';
import { useControllerDirectory } from './behavior/useControllerDirectory';
import {
  COUNT_LABEL, DIRECTORY_COLUMNS, DIRECTORY_GROUP_BY, DIRECTORY_SCHEMA, EMPTY_MESSAGE, SEARCH_LABEL, SEARCH_PLACEHOLDER,
} from './ControllerDirectory.constants';
import type { ControllerDirectoryProps, DirectoryRow } from './ControllerDirectory.type';
import './ControllerDirectory.css';

const getRowId = (row: DirectoryRow): string => row.id;

const ControllerDirectory = (props: ControllerDirectoryProps) => {
  const { onOpenController } = props;
  const { rows, shown, loaded, clauses, setClauses, search, setSearch, isRescanPending, handleRescan } = useControllerDirectory();

  const handleSelect = useCallback((id: string) => {
    const key = rows.find((row) => row.id === id)?.connectedKey;
    if (key) onOpenController?.(key);
  }, [rows, onOpenController]);

  return (
    <Box className="controller-directory">
      <PageActions>
        <RescanButton isPending={isRescanPending} onRescan={handleRescan} />
      </PageActions>
      <FilterBar
        schema={DIRECTORY_SCHEMA}
        clauses={clauses}
        onChange={setClauses}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={SEARCH_PLACEHOLDER}
        searchLabel={SEARCH_LABEL}
        fields={['family', 'group']}
      />
      <DataTable
        key={loaded ? 'loaded' : 'loading'}
        rows={shown}
        schema={DIRECTORY_SCHEMA}
        getRowId={getRowId}
        fallbackColumns={DIRECTORY_COLUMNS}
        fallbackGroupBy={DIRECTORY_GROUP_BY}
        onSelect={handleSelect}
        countLabel={COUNT_LABEL}
        emptyMessage={EMPTY_MESSAGE}
      />
    </Box>
  );
};

export { ControllerDirectory };
