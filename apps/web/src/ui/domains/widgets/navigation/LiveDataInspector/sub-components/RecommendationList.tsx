/* @layer renderer-widgets @kind component */
/**
 * The findings for the current screen: a collapsible count header, one card
 * per open finding (certain-first, oldest-first — the same pass order the
 * Data Inspector's own review works through), and a batch-accept button that
 * only appears once there is something safe to batch.
 */
import { useState } from 'react';
import { Box, Button, Text } from '@ds/primitives';
import { certainOnly } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/accept-all-certain';
import { acceptAllCertainHere } from '../behavior/accept-all-certain-here';
import { RecommendationCard } from './RecommendationCard';
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
  const certainCount = certainOnly(entries).length;

  if (entries.length === 0) return null;

  const acceptAll = async (): Promise<void> => {
    setBusy(true);
    try { await acceptAllCertainHere(entries); } finally { setBusy(false); }
  };

  return (
    <Box className="live-rec-list">
      <Button variant="bare" className="live-rec-list__header" onClick={() => setCollapsed(!collapsed)}>
        <Text className="live-rec-list__count">{`${entries.length} recommendation${entries.length === 1 ? '' : 's'} on this screen`}</Text>
        <Text className="live-rec-list__chevron">{collapsed ? '▸' : '▾'}</Text>
      </Button>
      {!collapsed && (
        <Box className="live-rec-list__body">
          {certainCount >= MIN_BATCH && (
            <Button variant="secondary" size="sm" disabled={busy} onClick={() => void acceptAll()}>
              {`Accept all certain (${certainCount})`}
            </Button>
          )}
          {entries.map(entry => <RecommendationCard key={entry.id} entry={entry} />)}
        </Box>
      )}
    </Box>
  );
};

export { RecommendationList };
export type { RecommendationListProps };
