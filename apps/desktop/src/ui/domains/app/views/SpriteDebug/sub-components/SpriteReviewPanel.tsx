/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  SPRITE_MANIFEST,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from '@shared/game/sprites';
import type { SpriteCategory } from '@shared/game/sprites';
import type { ReviewStatus, ReviewData } from '../SpriteDebug.type';
import { Box } from '../../../../../design-system/primitives';
import { CategoryButton, FilterBtns, Stats } from './ReviewControls';
import { SpriteImageCard } from './ReviewCards';
import { S } from '../SpriteDebug.constants';

const SpriteReviewPanel = ({ baseUrl }: { baseUrl: string }) => {
  const [data, setData] = useState<ReviewData>({});
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | ReviewStatus>('all');
  const [catFilter, setCatFilter] = useState<'all' | SpriteCategory>('all');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    window.api.loadSpriteReview().then(d => { setData((d ?? {}) as ReviewData); setLoaded(true); });
  }, []);

  const persist = useCallback((next: ReviewData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => window.api.saveSpriteReview(next), 300);
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

  const catCounts = useMemo(() => {
    const cc: Record<string, number> = { all: SPRITE_MANIFEST.length };
    for (const cat of CATEGORY_ORDER) cc[cat] = SPRITE_MANIFEST.filter(s => s.category === cat).length;
    return cc;
  }, []);

  const filtered = useMemo(() => SPRITE_MANIFEST.filter(s => {
    if (catFilter !== 'all' && s.category !== catFilter) return false;
    if (filter !== 'all' && (data[s.file]?.status ?? 'neutral') !== filter) return false;
    return true;
  }), [filter, catFilter, data]);

  if (!loaded) return null;

  return (
    <>
      <Box style={S.header}>
        <Box style={S.tabGroup}>
          <CategoryButton label="All" value="all" current={catFilter} onClick={v => setCatFilter(v as never)} count={catCounts.all} />
          {CATEGORY_ORDER.map(c => (
            <CategoryButton key={c} label={CATEGORY_LABELS[c]} value={c} current={catFilter} onClick={v => setCatFilter(v as never)} count={catCounts[c]} />
          ))}
        </Box>
        <Stats counts={counts} total={SPRITE_MANIFEST.length} />
        <Box style={S.headerButtons}>
          <FilterBtns filter={filter} setFilter={setFilter} />
          <Box as="button" onClick={() => { setData({}); window.api.saveSpriteReview({}); }} style={S.resetBtn}>Reset</Box>
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
