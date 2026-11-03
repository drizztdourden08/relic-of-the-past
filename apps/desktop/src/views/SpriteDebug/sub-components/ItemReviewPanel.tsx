/* @layer renderer-components @kind component */
import { useState, useMemo } from 'react';
import type { ReviewStatus } from '../SpriteDebug.type';
import { Box } from '@drizztdourden08/tessera/primitives';
import { ReviewHeader } from './ReviewHeader';
import { ItemAssocCard } from './ItemAssocCard';
import { ALL_ITEMS } from './ItemReviewPanel.constants';
import { useReviewData } from '../behavior/useReviewData';
import { loadSpriteDebug, saveSpriteDebug } from '@app/storage/sprites-store';

const ItemReviewPanel = ({ baseUrl }: { baseUrl: string }) => {
  const { data, loaded, setStatus, setComment, reset } = useReviewData({ load: loadSpriteDebug, save: saveSpriteDebug });
  const [filter, setFilter] = useState<'all' | ReviewStatus>('all');

  const counts = useMemo(() => {
    const c = { good: 0, bad: 0, neutral: 0, yellow: 0 };
    ALL_ITEMS.forEach(i => { c[data[i.id]?.status ?? 'neutral']++; });
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    if (filter === 'all') return ALL_ITEMS;
    return ALL_ITEMS.filter(i => (data[i.id]?.status ?? 'neutral') === filter);
  }, [filter, data]);

  if (!loaded) return null;

  return (
    <>
      <ReviewHeader counts={counts} total={ALL_ITEMS.length} filter={filter} setFilter={setFilter} onReset={reset} />
      <Box className="sprite-debug-grid">
        {filtered.map(item => (
          <ItemAssocCard
            key={item.id}
            item={item}
            entry={data[item.id] ?? { status: 'neutral' }}
            baseUrl={baseUrl}
            onSetStatus={s => setStatus(item.id, s)}
            onSetComment={c => setComment(item.id, c)}
          />
        ))}
      </Box>
    </>
  );
};

export { ItemReviewPanel };
