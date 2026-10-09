/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text, EmptyState, Icon } from '@drizztdourden08/tessera/primitives';
import { matchTabs } from './match-tabs';
import { HubSearchTabChip } from './HubSearchTabChip';
import { HubSearchGroup } from './HubSearchGroup';
import { IDLE_MARK_SIZE } from './hub-search.constants';
import type { HubSearchResultsProps } from './hub-search.type';
import './HubSearchResults.css';

const HubSearchResults = (props: HubSearchResultsProps) => {
  const { query, tabs, onOpenTab, ...content } = props;
  const q = query.trim().toLowerCase();
  const matches = useMemo(() => matchTabs(tabs, content.settings, q), [tabs, content.settings, q]);
  const noun = matches.total === 1 ? 'setting matches' : 'settings match';

  if (!q) {
    return (
      <Box as="section" className="hub-search hub-search--idle" aria-label="Search">
        <EmptyState
          className="hub-search__empty"
          icon={<Icon name="search" effect="twinkle" className="search-glass" size={IDLE_MARK_SIZE} />}
          message="Type to search every setting, on every tab."
        />
      </Box>
    );
  }

  return (
    <Box as="section" className="hub-search" aria-label="Search results">
      <Box className="hub-search__head">
        <Text className="hub-search__summary">
          {matches.total > 0 ? `${matches.total} ${noun} "${query.trim()}"` : `No setting matches "${query.trim()}"`}
        </Text>
        {matches.byName.length > 0 && (
          <Box className="hub-search__tabs">
            {matches.byName.map((tab) => (
              <HubSearchTabChip key={tab} tab={tab} onOpenTab={onOpenTab} />
            ))}
          </Box>
        )}
      </Box>

      <Box className="hub-search__body">
        {matches.total === 0 && (
          <EmptyState className="hub-search__empty" message="Try a shorter word, or the name of what the setting changes." />
        )}
        {matches.withRows.map(({ tab, count }) => (
          <HubSearchGroup key={tab} tab={tab} count={count} query={q} content={content} onOpenTab={onOpenTab} />
        ))}
      </Box>
    </Box>
  );
};

export { HubSearchResults };
