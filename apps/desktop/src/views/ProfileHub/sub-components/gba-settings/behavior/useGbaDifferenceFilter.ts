/* @layer renderer-components @kind hook */
import { useMemo, useState } from 'react';
import { GBA_DIFFERENCES } from '@rotp/features';
import { compile, compileTextSearch } from '@drizztdourden08/tessera/data';
import type { FilterClause } from '@drizztdourden08/tessera/data';
import { GBA_SCHEMA } from '../gba-settings.constants';

const useGbaDifferenceFilter = () => {
  const [clauses, setClauses] = useState<readonly FilterClause[]>([]);
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const matched = GBA_DIFFERENCES.filter(compile(clauses, GBA_SCHEMA));
    const test = compileTextSearch(search);
    return test ? matched.filter(test) : matched;
  }, [clauses, search]);

  return { clauses, setClauses, search, setSearch, rows };
};

export { useGbaDifferenceFilter };
