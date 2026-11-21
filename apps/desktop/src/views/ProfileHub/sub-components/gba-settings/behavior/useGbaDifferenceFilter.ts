/* @layer renderer-components @kind hook */
import { useMemo, useState } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { GBA_DIFFERENCES } from '@rotp/features';
import { compile, compileTextSearch } from '@drizztdourden08/tessera/data';
import type { FilterClause } from '@drizztdourden08/tessera/data';
import { gbaSchema } from '../gba-settings.constants';

const useGbaDifferenceFilter = () => {
  const t = useT();
  const schema = useMemo(() => gbaSchema(t), [t]);
  const [clauses, setClauses] = useState<readonly FilterClause[]>([]);
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const matched = GBA_DIFFERENCES.filter(compile(clauses, schema));
    const test = compileTextSearch(search);
    return test ? matched.filter(test) : matched;
  }, [clauses, search, schema]);

  return { schema, clauses, setClauses, search, setSearch, rows };
};

export { useGbaDifferenceFilter };
