import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ITEM_SPRITE_MAP } from '@shared/game/items/sprites';
import {
  SPRITE_MANIFEST,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type SpriteCategory,
  type SpriteManifestEntry,
} from '@shared/game/sprites';
import type { SpriteDebugProps, ReviewStatus, ReviewMode, ReviewEntry, ReviewData } from './types';

// Dev debug page uses static public path (these sprites are in /public/sprites/items/)
function devSpritePath(file: string): string {
  return `/sprites/items/${file}.png`;
}

// ─── Root component ───


const SpriteDebug = (props: SpriteDebugProps) => {
  const { onClose } = props;
  const [mode, setMode] = useState<ReviewMode>('sprites');

  return (
    <div style={S.overlay}>
      {/* Top bar with mode toggle + close */}
      <div style={S.topBar}>
        <div style={S.modeToggle}>
          <button
            onClick={() => setMode('sprites')}
            style={{ ...S.modeBtn, ...(mode === 'sprites' ? S.modeBtnActive : {}) }}
          >
            Sprite Review
          </button>
          <button
            onClick={() => setMode('items')}
            style={{ ...S.modeBtn, ...(mode === 'items' ? S.modeBtnActive : {}) }}
          >
            Item Association
          </button>
        </div>
        <span style={S.modeHint}>
          {mode === 'sprites'
            ? 'Does each extracted image look correct?'
            : 'Is each item mapped to the right sprite?'}
        </span>
        <button onClick={onClose} style={S.closeBtn}>✕</button>
      </div>

      {mode === 'sprites' ? <SpriteReviewPanel /> : <ItemReviewPanel />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PANEL 1: Sprite Review — all extracted images by category
// Persistence: sprite-review.json (keyed by filename)
// ═══════════════════════════════════════════════════════════════════════════════

function SpriteReviewPanel() {
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
      <div style={S.header}>
        <div style={S.tabGroup}>
          <CatBtn label="All" value="all" current={catFilter} onClick={v => setCatFilter(v as never)} count={catCounts.all} />
          {CATEGORY_ORDER.map(c => (
            <CatBtn key={c} label={CATEGORY_LABELS[c]} value={c} current={catFilter} onClick={v => setCatFilter(v as never)} count={catCounts[c]} />
          ))}
        </div>
        <Stats counts={counts} total={SPRITE_MANIFEST.length} />
        <div style={S.headerButtons}>
          <FilterBtns filter={filter} setFilter={setFilter} />
          <button onClick={() => { setData({}); window.api.saveSpriteReview({}); }} style={S.resetBtn}>Reset</button>
        </div>
      </div>
      <div style={S.grid}>
        {filtered.map(sprite => (
          <SpriteImageCard
            key={sprite.file}
            sprite={sprite}
            entry={data[sprite.file] ?? { status: 'neutral' }}
            onSetStatus={s => setStatus(sprite.file, s)}
            onSetComment={c => setComment(sprite.file, c)}
          />
        ))}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PANEL 2: Item Association Review — each item → its mapped sprite
// Persistence: sprite-debug.json (keyed by item name)
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_ITEMS = Object.entries(ITEM_SPRITE_MAP).map(([name, file]) => ({
  name,
  file,
  src: file ? devSpritePath(file) : '',
}));

function ItemReviewPanel() {
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
            onSetStatus={s => setStatus(item.name, s)}
            onSetComment={c => setComment(item.name, c)}
          />
        ))}
      </div>
    </>
  );
}

// ─── Shared sub-components ───

function Stats({ counts, total }: { counts: { good: number; neutral: number; bad: number; yellow: number }; total: number }) {
  return (
    <div style={S.stats}>
      <span style={{ color: '#4caf50' }}>{counts.good} good</span>
      <span style={{ color: '#f5c542' }}>{counts.yellow} re-review</span>
      <span style={{ color: '#999' }}>{counts.neutral} unchecked</span>
      <span style={{ color: '#f44336' }}>{counts.bad} bad</span>
      <span style={{ color: '#666' }}>/ {total}</span>
    </div>
  );
}

function FilterBtns({ filter, setFilter }: { filter: 'all' | ReviewStatus; setFilter: (v: 'all' | ReviewStatus) => void }) {
  return (
    <>
      {(['all', 'neutral', 'good', 'yellow', 'bad'] as const).map(v => {
        const label = v === 'all' ? 'All' : v === 'neutral' ? 'Unchecked' : v === 'good' ? 'Good' : v === 'yellow' ? 'Re-review' : 'Bad';
        const active = filter === v;
        return (
          <button key={v} onClick={() => setFilter(v)} style={{ ...S.filterBtn, ...(active ? S.filterBtnActive : {}) }}>
            {label}
          </button>
        );
      })}
    </>
  );
}

function CatBtn({ label, value, current, onClick, count }: {
  label: string; value: string; current: string; onClick: (v: string) => void; count: number;
}) {
  const active = current === value;
  return (
    <button onClick={() => onClick(value)} style={{ ...S.catTab, ...(active ? S.catTabActive : {}) }}>
      {label} <span style={{ opacity: 0.5, fontSize: 10 }}>({count})</span>
    </button>
  );
}

function StatusBtns({ current, onClick }: { current: ReviewStatus; onClick: (s: ReviewStatus) => void }) {
  return (
    <div style={S.statusBtns}>
      {([['✓', 'good', '#4caf50'], ['●', 'yellow', '#f5c542'], ['—', 'neutral', '#888'], ['✗', 'bad', '#f44336']] as const).map(([icon, st, color]) => {
        const active = current === st;
        return (
          <button key={st} onClick={() => onClick(st)} style={{
            ...S.statusBtn,
            color: active ? '#fff' : color,
            background: active ? color : 'transparent',
            borderColor: active ? color : 'rgba(255,255,255,0.15)',
          }}>
            {icon}
          </button>
        );
      })}
    </div>
  );
}

// ─── Card: Sprite Review ───

function SpriteImageCard({ sprite, entry, onSetStatus, onSetComment }: {
  sprite: SpriteManifestEntry; entry: ReviewEntry;
  onSetStatus: (s: ReviewStatus) => void; onSetComment: (c: string) => void;
}) {
  const border = entry.status === 'good' ? '#4caf50' : entry.status === 'bad' ? '#f44336' : entry.status === 'yellow' ? '#f5c542' : 'rgba(255,255,255,0.08)';
  const bg = entry.status === 'good' ? 'rgba(76,175,80,0.06)' : entry.status === 'bad' ? 'rgba(244,67,54,0.06)' : entry.status === 'yellow' ? 'rgba(245,197,66,0.06)' : 'rgba(255,255,255,0.02)';
  const catColor = sprite.category === 'hud' ? '#8bb4e0' : sprite.category === 'receipt' ? '#c4a862' : '#82c487';

  return (
    <div style={{ ...S.card, borderColor: border, background: bg }}>
      <div style={S.cardTop}>
        <div style={S.spriteWrap}>
          <img src={devSpritePath(sprite.file)} alt={sprite.label} style={S.sprite} draggable={false}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div style={S.cardInfo}>
          <span style={S.itemName}>{sprite.label}</span>
          <span style={S.fileName}>{sprite.file}.png</span>
          <span style={{ fontSize: 9, color: catColor }}>{sprite.category}</span>
        </div>
        <StatusBtns current={entry.status} onClick={onSetStatus} />
      </div>
      {(entry.status === 'bad' || entry.status === 'yellow') && (
        <input style={S.commentInput} placeholder="What's wrong with this sprite?"
          value={entry.comment ?? ''} onChange={e => onSetComment(e.target.value)}
          onClick={e => e.stopPropagation()} />
      )}
    </div>
  );
}

// ─── Card: Item Association ───

function ItemAssocCard({ item, entry, onSetStatus, onSetComment }: {
  item: { name: string; file: string; src: string }; entry: ReviewEntry;
  onSetStatus: (s: ReviewStatus) => void; onSetComment: (c: string) => void;
}) {
  const border = entry.status === 'good' ? '#4caf50' : entry.status === 'bad' ? '#f44336' : entry.status === 'yellow' ? '#f5c542' : 'rgba(255,255,255,0.08)';
  const bg = entry.status === 'good' ? 'rgba(76,175,80,0.06)' : entry.status === 'bad' ? 'rgba(244,67,54,0.06)' : entry.status === 'yellow' ? 'rgba(245,197,66,0.06)' : 'rgba(255,255,255,0.02)';

  return (
    <div style={{ ...S.card, borderColor: border, background: bg }}>
      <div style={S.cardTop}>
        <div style={S.spriteWrap}>
          {item.src ? (
            <img src={item.src} alt={item.name} style={S.sprite} draggable={false}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <span style={{ fontSize: 9, color: '#555' }}>none</span>
          )}
        </div>
        <div style={S.cardInfo}>
          <span style={S.itemName}>{item.name}</span>
          <span style={S.fileName}>{item.file ? `${item.file}.png` : '(no sprite)'}</span>
        </div>
        <StatusBtns current={entry.status} onClick={onSetStatus} />
      </div>
      {(entry.status === 'bad' || entry.status === 'yellow') && (
        <input style={S.commentInput} placeholder="Which sprite should this item use?"
          value={entry.comment ?? ''} onChange={e => onSetComment(e.target.value)}
          onClick={e => e.stopPropagation()} />
      )}
    </div>
  );
}

// ─── Styles ───

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#111118',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: "'JetBrains Mono', monospace",
    // @ts-expect-error Electron-specific CSS property
    WebkitAppRegion: 'no-drag',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '8px 20px',
    borderBottom: '2px solid #444',
    flexShrink: 0,
    background: '#0d0d12',
  },
  modeToggle: {
    display: 'flex',
    gap: 0,
    borderRadius: 6,
    overflow: 'hidden',
    border: '2px solid rgba(100,160,255,0.3)',
  },
  modeBtn: {
    padding: '5px 16px',
    background: 'rgba(255,255,255,0.03)',
    border: 'none',
    color: '#888',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  modeBtnActive: {
    background: 'rgba(100,160,255,0.2)',
    color: '#b8d4ff',
  },
  modeHint: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  closeBtn: {
    padding: '3px 8px',
    background: 'none',
    border: '1px solid #555',
    borderRadius: 4,
    color: '#ccc',
    fontSize: 14,
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 20px',
    borderBottom: '1px solid #333',
    flexShrink: 0,
    flexWrap: 'wrap',
  },
  tabGroup: {
    display: 'flex',
    gap: 0,
    borderRadius: 4,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  catTab: {
    padding: '3px 10px',
    background: 'rgba(255,255,255,0.04)',
    border: 'none',
    color: '#999',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.1s',
  },
  catTabActive: {
    background: 'rgba(100,160,255,0.2)',
    color: '#b8d4ff',
  },
  stats: {
    display: 'flex',
    gap: 10,
    fontSize: 12,
  },
  headerButtons: {
    display: 'flex',
    gap: 4,
    marginLeft: 'auto',
  },
  filterBtn: {
    padding: '3px 10px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 4,
    color: '#999',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  filterBtnActive: {
    background: 'rgba(100,160,255,0.15)',
    borderColor: 'rgba(100,160,255,0.5)',
    color: '#b8d4ff',
  },
  resetBtn: {
    padding: '3px 10px',
    background: 'rgba(255,100,100,0.1)',
    border: '1px solid rgba(255,100,100,0.25)',
    borderRadius: 4,
    color: '#ff9090',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginLeft: 8,
  },
  grid: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 6,
    padding: 12,
    alignContent: 'start',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: '6px 8px',
    borderRadius: 6,
    border: '2px solid rgba(255,255,255,0.08)',
    transition: 'border-color 0.15s, background 0.15s',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  spriteWrap: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
    borderRadius: 4,
  },
  sprite: {
    width: 32,
    height: 32,
    imageRendering: 'pixelated' as const,
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  itemName: {
    fontSize: 12,
    color: '#e0e0e0',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileName: {
    fontSize: 10,
    color: '#666',
  },
  statusBtns: {
    display: 'flex',
    gap: 3,
    flexShrink: 0,
  },
  statusBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    fontFamily: 'inherit',
    transition: 'all 0.1s',
  },
  commentInput: {
    marginTop: 4,
    padding: '4px 6px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(244,67,54,0.3)',
    borderRadius: 3,
    color: '#e0e0e0',
    fontSize: 11,
    fontFamily: 'inherit',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
};

export { SpriteDebug };
