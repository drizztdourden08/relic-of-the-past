/* @layer renderer-widgets @kind component */
/**
 * The findings for the current screen: a collapsible count header, a tab
 * strip classifying them by what accepting one would DO (change, add, drop),
 * one card per open finding within the selected tab (certain-first,
 * oldest-first — the same pass order the Data Inspector's own review works
 * through), and a batch-accept button that only appears once there is
 * something safe to batch.
 *
 * The card list is its own bounded, scrolling region (see RecommendationList.css)
 * so a long finding list can never squeeze the record region below it down to
 * nothing — the bug this replaced.
 */
import { useState } from 'react';
import { Box, Button, ScrollArea, Text } from '@ds/primitives';
import { certainOnly } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/accept-all-certain';
import { acceptAllCertainHere } from '../behavior/accept-all-certain-here';
import { useRecommendationFilter } from '../behavior/use-recommendation-filter';
import { RecommendationCard } from './RecommendationCard';
import { RecommendationTabs } from './RecommendationTabs';
import type { Recommendation } from '@shared/game/recommendations';
import './RecommendationList.css';

const MIN_BATCH = 2;

interface RecommendationListProps {
  entries: readonly Recommendation[];
}

const RecommendationList = (props: RecommendationListProps) => {
  const { entries } = props;
  const [collapsed, setCollapsed] = useState(false);
  const [busy, setBusy] = useState(false);
  const { tabs, filter, setFilter, filtered } = useRecommendationFilter(entries);
  const certainCount = certainOnly(filtered).length;

  if (entries.length === 0) return null;

  // Operates on `filtered`, not `entries` — a hidden tab must never let a
  // reviewer batch-accept a finding they cannot currently see.
  const acceptAll = async (): Promise<void> => {
    setBusy(true);
    try { await acceptAllCertainHere(filtered); } finally { setBusy(false); }
  };

  return (
    <Box className="live-rec-list">
      <Button variant="bare" className="live-rec-list__header" onClick={() => setCollapsed(!collapsed)}>
        <Text className="live-rec-list__count">{`${entries.length} recommendation${entries.length === 1 ? '' : 's'} on this screen`}</Text>
        <Text className="live-rec-list__chevron">{collapsed ? '▸' : '▾'}</Text>
      </Button>
      {!collapsed && (
        <>
          <RecommendationTabs tabs={tabs} selected={filter} onSelect={setFilter} />
          {/* Outside the scrolling list on purpose: the whole point of the batch
              is a long list, and a button that scrolls away with the cards it
              acts on is unreachable exactly when it is most useful. */}
          {certainCount >= MIN_BATCH && (
            <Button
              variant="secondary"
              size="sm"
              className="live-rec-list__batch"
              disabled={busy}
              onClick={() => void acceptAll()}
            >
              {`Accept all certain in view (${certainCount})`}
            </Button>
          )}
          <ScrollArea className="live-rec-list__body">
            {filtered.map(entry => <RecommendationCard key={entry.id} entry={entry} />)}
          </ScrollArea>
        </>
      )}
    </Box>
  );
};

export { RecommendationList };
export type { RecommendationListProps };
