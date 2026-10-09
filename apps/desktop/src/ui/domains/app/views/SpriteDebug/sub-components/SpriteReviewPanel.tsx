/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SPRITE_MANIFEST, CATEGORY_LABELS, CATEGORY_ORDER } from '@rotp/game-data';
import type { SpriteCategory } from '@rotp/game-data';
import type { ReviewStatus, ReviewData } from '../SpriteDebug.type';
import { Box, Button, Tabs } from '@drizztdourden08/tessera/primitives';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import { FilterBtns } from './FilterBtns';
import { ReviewStats } from './ReviewStats';
import { SpriteImageCard } from './SpriteImageCard';
import { loadSpriteReview, saveSpriteReview } from '@app/lib/storage/sprites-store';
import { S } from '../SpriteDebug.constants';

const SpriteReviewPanel = ({ baseUrl }: { baseUrl: string }) => {
  const [data, setData] = useState<ReviewData>({});
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | ReviewStatus>('all');
  const [catFilter, setCatFilter] = useState<'all' | SpriteCategory>('all');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadSpriteReview().then(d => { setData((d ?? {}) as ReviewData); setLoaded(true); });
  }, []);

  const persist = useCallback((next: ReviewData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveSpriteReview(next), 300);
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
    SPRITE_MANIFEST.forEach(s => { c[data[s.file]?.status ?? 'neutral']++; });
    return c;
  }, [data]);

  const catTabs = useMemo((): TabItem[] => [
    { id: 'all', label: 'All', badge: SPRITE_MANIFEST.length },
    ...CATEGORY_ORDER.map((c) => ({
      id: c, label: CATEGORY_LABELS[c], badge: SPRITE_MANIFEST.filter((s) => s.category === c).length,
    })),
  ], []);

  const filtered = useMemo(() => SPRITE_MANIFEST.filter(s => {
    if (catFilter !== 'all' && s.category !== catFilter) return false;
    if (filter !== 'all' && (data[s.file]?.status ?? 'neutral') !== filter) return false;
    return true;
  }), [filter, catFilter, data]);

  if (!loaded) return null;

  return (
    <>
      <Box style={S.header}>
        <Tabs tabs={catTabs} activeTab={catFilter} onTabChange={(id) => setCatFilter(id as 'all' | SpriteCategory)} />
        <ReviewStats counts={counts} total={SPRITE_MANIFEST.length} />
        <Box style={S.headerButtons}>
          <FilterBtns filter={filter} setFilter={setFilter} />
          <Button variant="danger" size="xs" onClick={() => { setData({}); saveSpriteReview({}); }}>Reset</Button>
        </Box>
      </Box>
      <Box style={S.grid}>
        {filtered.map(sprite => (
          <SpriteImageCard
            key={sprite.file}
            sprite={sprite}
            entry={data[sprite.file] ?? { status: 'neutral' }}
            baseUrl={baseUrl}
            onSetStatus={s => setStatus(sprite.file, s)}
            onSetComment={c => setComment(sprite.file, c)}
          />
        ))}
      </Box>
    </>
  );
};

export { SpriteReviewPanel };
