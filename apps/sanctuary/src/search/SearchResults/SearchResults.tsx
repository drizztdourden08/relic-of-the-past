/* @layer sanctuary-site @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box, Button, Text, EmptyState } from '@drizztdourden08/tessera/primitives';
import { SearchSpark, DataTable } from '@drizztdourden08/tessera/composites';
import { fileRowId } from '../../files/file-row';
import { FILE_DEFAULT_COLUMNS } from '../../files/file-schema.constants';
import { reportRowId } from '../../reports/report-row';
import { REPORT_DEFAULT_COLUMNS, REPORT_DEFAULT_GROUP_BY } from '../../reports/report-schema.constants';
import { useSearchResults } from './behavior/useSearchResults';
import { SearchGroup } from '@site-kit/components/SearchGroup/SearchGroup';
import { FILE_COUNT, IDLE_MARK_SIZE, REPORT_COUNT } from './SearchResults.constants';
import type { SearchResultsProps } from './SearchResults.type';
import './SearchResults.css';

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
              <Button key={category.key} variant="bare" className="search-pill" onClick={() => results.open(category)}>
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
          <SearchGroup key={category.key} label={category.label} icon={category.icon} count={rows.length} onOpen={() => results.open(category)}>
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
          <SearchGroup key={category.key} label={category.label} icon={category.icon} count={rows.length} onOpen={() => results.open(category)}>
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
