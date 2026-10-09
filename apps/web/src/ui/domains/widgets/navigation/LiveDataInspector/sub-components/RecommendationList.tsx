/* @layer renderer-widgets @kind component */
import { useState } from 'react';
import { Box, Button, ScrollArea, Text } from '@ds/primitives';
import { certainOnly } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/accept-all-certain';
import { useWidgetPref } from '@app/hooks/useWidgetPref';
import { acceptAllCertainHere } from '../behavior/accept-all-certain-here';
import { batchOutcomeMessage } from '../behavior/batch-outcome-message';
import { useRecommendationFilter } from '../behavior/useRecommendationFilter';
import { MIN_BATCH } from '../LiveDataInspector.constants';
import type { RecommendationListProps } from '../LiveDataInspector.type';
import { RecommendationCard } from './RecommendationCard';
import { RecommendationTabs } from './RecommendationTabs';
import './RecommendationList.css';

const RecommendationList = (props: RecommendationListProps) => {
  const { entries } = props;
  const [collapsed, setCollapsed] = useWidgetPref<boolean>('dataset', 'recCollapsed', false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);
  const { tabs, filter, setFilter, filtered } = useRecommendationFilter(entries);
  const certainCount = certainOnly(filtered).length;

  if (entries.length === 0) return null;

  const acceptAll = async (): Promise<void> => {
    setBusy(true);
    setOutcome(null);
    try { setOutcome(batchOutcomeMessage(await acceptAllCertainHere(filtered))); } finally { setBusy(false); }
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
          {outcome && <Text className="live-rec-list__outcome">{outcome}</Text>}
          <ScrollArea className="live-rec-list__body">
            {filtered.map(entry => <RecommendationCard key={entry.id} entry={entry} />)}
          </ScrollArea>
        </>
      )}
    </Box>
  );
};

export { RecommendationList };
