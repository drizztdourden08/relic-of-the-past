import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ITEM_SPRITE_MAP } from '@shared/game/items/sprites';
import type { ReviewStatus, ReviewData } from '../types';
import { FilterBtns, Stats } from './ReviewControls';
import { ItemAssocCard } from './ReviewCards';
import { S } from '../styles';

const ALL_ITEMS = Object.entries(ITEM_SPRITE_MAP).map(([name, file]) => ({
  name,
  file,
}));

function ItemReviewPanel({ baseUrl }: { baseUrl: string }) {
  const [data, setData] = useState<ReviewData>({});
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | ReviewStatus>('all');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    window.api.loadSpriteDebug().then(d => { setData((d ?? {}) as ReviewData); setLoaded(true); });
  }, []);

  const persist = useCallback((next: ReviewData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => window.api.saveSpriteDebug(next), 300);
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
    ALL_ITEMS.forEach(i => { c[data[i.name]?.status ?? 'neutral']++; });
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    if (filter === 'all') return ALL_ITEMS;
    return ALL_ITEMS.filter(i => (data[i.name]?.status ?? 'neutral') === filter);
  }, [filter, data]);

  if (!loaded) return null;

  return (
    <>
      <div style={S.header}>
        <Stats counts={counts} total={ALL_ITEMS.length} />
        <div style={S.headerButtons}>
          <FilterBtns filter={filter} setFilter={setFilter} />
          <button onClick={() => { setData({}); window.api.saveSpriteDebug({}); }} style={S.resetBtn}>Reset</button>
        </div>
      </div>
      <div style={S.grid}>
        {filtered.map(item => (
          <ItemAssocCard
            key={item.name}
            item={item}
            entry={data[item.name] ?? { status: 'neutral' }}
            baseUrl={baseUrl}
            onSetStatus={s => setStatus(item.name, s)}
            onSetComment={c => setComment(item.name, c)}
          />
        ))}
      </div>
    </>
  );
}

export { ItemReviewPanel };
