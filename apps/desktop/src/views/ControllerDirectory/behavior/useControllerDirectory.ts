/* @layer renderer-components @kind hook */
import { useMemo, useState } from 'react';
import { compile } from '@drizztdourden08/tessera/data';
import type { FilterClause } from '@drizztdourden08/tessera/data';
import { useControllerDevices } from '@app/hooks/useControllerDevices';
import { DIRECTORY_SCHEMA } from '../ControllerDirectory.constants';
import { compareDirectoryRows } from './compare-directory-rows';
import { connectedKeyOf } from './connected-key-of';
import { directoryRowOf } from './directory-row';
import { matchDirectoryRow } from './match-directory-row';
import { useMappingEntries } from './useMappingEntries';

const useControllerDirectory = () => {
  const { entries: devices } = useControllerDevices();
  const connected = useMemo(() => devices.filter((device) => device.status === 'ready'), [devices]);
  const { entries, complete } = useMappingEntries(connected);
  const [clauses, setClauses] = useState<readonly FilterClause[]>([]);
  const [search, setSearch] = useState('');

  const rows = useMemo(
    () => entries.map((entry) => directoryRowOf(entry, connectedKeyOf(entry, connected))).sort(compareDirectoryRows),
    [entries, connected],
  );
  const shown = useMemo(() => {
    const byClauses = compile(clauses, DIRECTORY_SCHEMA);
    return rows.filter((row) => byClauses(row) && matchDirectoryRow(row, search));
  }, [rows, clauses, search]);

  return { rows, shown, complete, clauses, setClauses, search, setSearch };
};

export { useControllerDirectory };
