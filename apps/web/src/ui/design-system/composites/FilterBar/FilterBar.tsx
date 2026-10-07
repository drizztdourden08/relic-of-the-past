/* @layer renderer-components @kind component */
/**
 * One filter surface for a list of rows: a permanent free-text search, an
 * optional schema-driven clause list, and optional enumerated facets. The
 * search box is a fixed part of the bar, not something callers bolt on
 * beside it, so every screen that filters rows offers the same control in the
 * same place.
 *
 * The bar only ever reports state: the query through onSearchChange, plain
 * FilterClause values through onChange, a facet toggle through the facet's own
 * handler. Filters are data; the compiled predicates belong to whoever renders
 * the filtered rows, one layer up (data/filter/clause.ts's `compile` for the
 * clauses, data/filter/text-search.ts's `compileTextSearch` for the query).
 */
import { Box } from '../../primitives/Box';
import { TextInput } from '../../primitives/TextInput';
import { FacetPicker } from './sub-components/FacetPicker';
import { FilterClauseList } from './sub-components/FilterClauseList';
import type { FilterBarProps } from './FilterBar.type';
import './FilterBar.css';

const FilterBar = (props: FilterBarProps) => {
  const {
    search, onSearchChange, searchPlaceholder = 'Search...', searchLabel = 'Search',
    schema, clauses, onChange, facets, className,
  } = props;

  return (
    <Box className={`filter-bar${className ? ` ${className}` : ''}`}>
      <TextInput
        type="text"
        className="filter-bar__search"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label={searchLabel}
      />
      {schema !== undefined && clauses !== undefined && onChange !== undefined && (
        <FilterClauseList schema={schema} clauses={clauses} onChange={onChange} />
      )}
      {facets?.map((facet) => (
        <FacetPicker key={facet.id} facet={facet} />
      ))}
    </Box>
  );
};

export { FilterBar };
