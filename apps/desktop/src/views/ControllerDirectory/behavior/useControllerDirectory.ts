/* @layer renderer-components @kind hook */
import { useMemo, useState } from 'react';
import { compile } from '@drizztdourden08/tessera/data';
import type { FilterClause } from '@drizztdourden08/tessera/data';
import { useControllerDevices } from '@app/hooks/useControllerDevices';
import { DIRECTORY_SCHEMA } from '../ControllerDirectory.constants';
import { compareDirectoryRows } from './compare-directory-rows';
import { connectedRows } from './connected-rows';
import { knownRows } from './known-rows';
import { matchDirectoryRow } from './match-directory-row';
import { useMappingEntries } from './useMappingEntries';

const useControllerDirectory = () => {
  const { entries: devices, isRescanPending, handleRescan } = useControllerDevices();
  const { entries, loaded } = useMappingEntries(devices);
  const [clauses, setClauses] = useState<readonly FilterClause[]>([]);
  const [search, setSearch] = useState('');

  const rows = useMemo(
    () => [...connectedRows(devices, entries), ...knownRows(entries, devices)].sort(compareDirectoryRows),
    [devices, entries],
  );
  const shown = useMemo(() => {
    const byClauses = compile(clauses, DIRECTORY_SCHEMA);
    return rows.filter((row) => byClauses(row) && matchDirectoryRow(row, search));
  }, [rows, clauses, search]);

  return { rows, shown, loaded, clauses, setClauses, search, setSearch, isRescanPending, handleRescan };
};

export { useControllerDirectory };
