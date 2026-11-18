/* @layer renderer-components @kind component */
import type { GbaDifference } from '@rotp/features';
import { useT } from '@drizztdourden08/brock-react';
import { Stack } from '@drizztdourden08/tessera/primitives';
import { DataTable, FilterBar } from '@drizztdourden08/tessera/composites';
import { useGbaDifferenceFilter } from './behavior/useGbaDifferenceFilter';
import { GBA_TABLE_COLUMNS, gbaCountLabel } from './gba-settings.constants';

const getRowId = (row: GbaDifference): string => row.id;

const GbaDifferenceTable = () => {
  const t = useT();
  const { schema, clauses, setClauses, search, setSearch, rows } = useGbaDifferenceFilter();

  return (
    <Stack gap="md" align="stretch">
      <FilterBar
        schema={schema}
        clauses={clauses}
        onChange={setClauses}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('profiles:gba.search-placeholder')}
        searchLabel={t('profiles:gba.search-label')}
      />
      <DataTable
        rows={rows}
        schema={schema}
        getRowId={getRowId}
        fallbackColumns={GBA_TABLE_COLUMNS}
        countLabel={gbaCountLabel(t)}
        emptyMessage={t('profiles:gba.empty')}
      />
    </Stack>
  );
};

export { GbaDifferenceTable };
