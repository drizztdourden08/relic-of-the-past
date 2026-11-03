/* @layer site-kit @kind hook */
import { useMemo } from 'react';
import type { SchemaLike } from '@drizztdourden08/tessera/data';
import type { SiteViews } from '../../saved-views/create-view-storage.type';
import { filterRows } from '../../saved-views/filter-rows';
import { useSurfaceView } from '../useSurfaceView/useSurfaceView';

const useSurfaceRows = <T>(views: SiteViews, surface: string, schema: SchemaLike, rows: readonly T[]) => {
  const view = useSurfaceView(views, surface, schema);
  const shown = useMemo(
    () => filterRows({ rows, schema, clauses: view.clauses, search: view.search }),
    [rows, schema, view.clauses, view.search],
  );
  return { view, shown };
};

export { useSurfaceRows };
