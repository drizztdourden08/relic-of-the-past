/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { find } from '@shared/game/data';
import { spriteFilename } from '@shared/game/logic/queries/item-sprites';
import type { ReviewStatus, ReviewData } from '../SpriteDebug.type';
import { Box, Button } from '../../../../../design-system/primitives';
import { FilterBtns, Stats } from './ReviewControls';
import { ItemAssocCard } from './ReviewCards';
import { S } from '../SpriteDebug.constants';
import { loadSpriteDebug, saveSpriteDebug } from '@app/lib/storage/sprites-store';
import { migrateLegacyReviewKeys } from './migrate-review-keys';

const ALL_ITEMS = find('item', () => true).map(item => ({
  id: item.id,
  name: item.randomizerName,
  file: spriteFilename(item.spriteId) ?? '',
}));

const ItemReviewPanel = ({ baseUrl }: { baseUrl: string }) => {
  const [data, setData] = useState<ReviewData>({});
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | ReviewStatus>('all');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadSpriteDebug().then(d => {
      const migrated = migrateLegacyReviewKeys((d ?? {}) as ReviewData);
      setData(migrated);
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((next: ReviewData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveSpriteDebug(next), 300);
  }, []);

  const setStatus = (key: string, status: ReviewStatus) => {
    setData(prev => {
      const entry = prev[key] ?? { status: 'neutral' };
      const keepComment = status === 'bad' || status === 'yellow';
      const next = { ...prev, [key]: { ...entry, status, comment: keepComment ? (entry.comment ?? '') : undefined } };
      persist(next);
      return next;
    });
  };

  const setComment = (key: string, comment: string) => {
    setData(prev => {
      const entry = prev[key] ?? { status: 'bad' as ReviewStatus };
      const next = { ...prev, [key]: { ...entry, comment } };
      persist(next);
      return next;
    });
  };

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
      <Box style={S.header}>
        <Stats counts={counts} total={ALL_ITEMS.length} />
        <Box style={S.headerButtons}>
          <FilterBtns filter={filter} setFilter={setFilter} />
          <Button variant="bare" onClick={() => { setData({}); saveSpriteDebug({}); }} style={S.resetBtn}>Reset</Button>
        </Box>
      </Box>
      <Box style={S.grid}>
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
