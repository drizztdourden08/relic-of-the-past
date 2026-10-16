/* @layer renderer-components @kind component */
import type { GbaDifference } from '@rotp/features';
import { Stack } from '@drizztdourden08/tessera/primitives';
import { DataTable, FilterBar } from '@drizztdourden08/tessera/composites';
import { useGbaDifferenceFilter } from './behavior/useGbaDifferenceFilter';
import { GBA_COUNT_LABEL, GBA_SCHEMA, GBA_SEARCH_PLACEHOLDER, GBA_TABLE_COLUMNS } from './gba-settings.constants';

const getRowId = (row: GbaDifference): string => row.id;

const GbaDifferenceTable = () => {
  const { clauses, setClauses, search, setSearch, rows } = useGbaDifferenceFilter();

  return (
    <Stack gap="md" align="stretch">
      <FilterBar
        schema={GBA_SCHEMA}
        clauses={clauses}
        onChange={setClauses}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={GBA_SEARCH_PLACEHOLDER}
        searchLabel="Search differences"
      />
      <DataTable
        rows={rows}
        schema={GBA_SCHEMA}
        getRowId={getRowId}
        fallbackColumns={GBA_TABLE_COLUMNS}
        countLabel={GBA_COUNT_LABEL}
        emptyMessage="No difference matches."
      />
    </Stack>
  );
};

export { GbaDifferenceTable };
