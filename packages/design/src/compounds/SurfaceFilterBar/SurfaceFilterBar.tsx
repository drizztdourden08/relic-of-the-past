/* @layer site-kit @kind component */
import { FilterBar } from '@drizztdourden08/tessera/composites';
import { SavedViewsMenu } from '../SavedViewsMenu/SavedViewsMenu';
import type { SurfaceFilterBarProps } from './SurfaceFilterBar.type';

const SurfaceFilterBar = (props: SurfaceFilterBarProps) => {
  const { schema, view, placeholder, label } = props;
  return (
    <FilterBar
      schema={schema}
      clauses={view.clauses}
      onChange={view.setClauses}
      search={view.search}
      onSearchChange={view.setSearch}
      searchPlaceholder={placeholder}
      searchLabel={label}
      extra={<SavedViewsMenu state={view.savedViews} />}
    />
  );
};

export { SurfaceFilterBar };
