/* @layer sanctuary-site @kind component */
/**
 * The site's search pane, shown in place of the page while the nav's search is in use:
 * an empty state until something is typed, then every matching file and report from
 * every list, grouped by category and drawn with the list pages' own table. Opening a
 * category or a row ends the search.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { EmptyState } from '@ds/primitives/EmptyState';
import { SearchSpark } from '@ds/composites/SearchSpark';
import { DataTable } from '@ds/composites/DataTable';
import { fileRowId } from '../../files/file-row';
import { FILE_DEFAULT_COLUMNS } from '../../files/file-schema';
import { reportRowId } from '../../reports/report-row';
import { REPORT_DEFAULT_COLUMNS, REPORT_DEFAULT_GROUP_BY } from '../../reports/report-schema';
import { useSearchResults } from './behavior/useSearchResults';
import { SearchGroup } from './sub-components/SearchGroup';
import './SearchResults.css';

type SearchResultsProps = {
  query: string;
  /** Ends the search; called after a category or a row is opened. */
  onDone: () => void;
};

const IDLE_MARK_SIZE = 40;
const FILE_COUNT = ['file', 'files'] as const;
const REPORT_COUNT = ['report', 'reports'] as const;

const summaryOf = (total: number, shown: string): string => {
  if (total === 0) return `No result matches "${shown}"`;
  return total === 1 ? `1 result matches "${shown}"` : `${total} results match "${shown}"`;
};

const SearchResults = (props: SearchResultsProps) => {
  const { query, onDone } = props;
  const shown = query.trim();
  const results = useSearchResults(shown.toLowerCase(), onDone);

  if (!shown) {
    return (
      <Box as="section" className="site-search site-search--idle" aria-label="Search">
        <EmptyState
          className="site-search__empty"
          icon={<SearchSpark size={IDLE_MARK_SIZE} />}
          message="Type to search every file and report."
        />
      </Box>
    );
  }

  const noMatch = results.loading ? 'Loading files and reports...' : 'Try a shorter word, or part of a name, tag or issue number.';

  return (
    <Box as="section" className="site-search" aria-label="Search results">
      <Box className="site-search__head">
        <Text className="site-search__summary">{summaryOf(results.total, shown)}</Text>
        {results.named.length > 0 && (
          <Box className="site-search__chips">
            {results.named.map((category) => (
              <Button key={category.key} variant="bare" className="site-search__chip" onClick={() => results.open(category)}>
                <IconifyIcon icon={category.icon} aria-hidden="true" />
                Open {category.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      <Box className="site-search__body">
        {results.total === 0 && <EmptyState className="site-search__empty" message={noMatch} />}
        {results.fileGroups.map(({ category, rows }) => (
          <SearchGroup key={category.key} category={category} count={rows.length} onOpen={results.open}>
            <DataTable
              rows={rows}
              schema={results.fileSchema}
              getRowId={fileRowId}
              fallbackColumns={FILE_DEFAULT_COLUMNS}
              onSelect={(id) => results.open(category, id)}
              countLabel={FILE_COUNT}
            />
          </SearchGroup>
        ))}
        {results.reportGroups.map(({ category, rows }) => (
          <SearchGroup key={category.key} category={category} count={rows.length} onOpen={results.open}>
            <DataTable
              rows={rows}
              schema={results.reportSchema}
              getRowId={reportRowId}
              fallbackColumns={REPORT_DEFAULT_COLUMNS}
              fallbackGroupBy={REPORT_DEFAULT_GROUP_BY}
              onSelect={(id) => results.open(category, id)}
              countLabel={REPORT_COUNT}
            />
          </SearchGroup>
        ))}
      </Box>
    </Box>
  );
};

export { SearchResults };
export type { SearchResultsProps };
