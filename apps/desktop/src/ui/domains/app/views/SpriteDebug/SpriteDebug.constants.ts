/* @layer renderer-components @kind constants */
import type React from 'react';
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { ReviewStatus } from './SpriteDebug.type';

const S: Record<string, React.CSSProperties> = {
  modeHint: {
    fontSize: 11,
    color: 'var(--c-text-muted)',
    fontStyle: 'italic',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 20px',
    borderBottom: '1px solid var(--c-border-strong)',
    flexShrink: 0,
    flexWrap: 'wrap',
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
    border: '2px solid var(--c-border)',
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
    background: 'var(--c-bg)',
    borderRadius: 4,
  },
  sprite: {
    maxWidth: 32,
    maxHeight: 32,
    objectFit: 'contain' as const,
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
    color: 'var(--c-text-dim)',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileName: {
    fontSize: 10,
    color: 'var(--c-text-muted)',
  },
  commentInput: {
    marginTop: 4,
    padding: '4px 6px',
    background: 'var(--c-hover)',
    border: '1px solid var(--c-danger-soft)',
    borderRadius: 3,
    color: 'var(--c-text-dim)',
    fontSize: 11,
    fontFamily: 'inherit',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
};

const MODES = [
  { id: 'sprites', label: 'Sprite Review' },
  { id: 'items', label: 'Item Association' },
];

const LABEL_STYLES: Record<string, React.CSSProperties> = {
  good: { color: 'var(--c-secondary-bright)' },
  warn: { color: 'var(--c-warning)' },
  dim: { color: 'var(--c-text-dim)' },
  danger: { color: 'var(--c-danger)' },
  muted: { color: 'var(--c-text-muted)' },
};

const NONE_LABEL: React.CSSProperties = { fontSize: 9, color: 'var(--c-text-muted)' };

const FILTER_OPTIONS: SegmentOption<'all' | ReviewStatus>[] = [
  { value: 'all', label: 'All' },
  { value: 'neutral', label: 'Unchecked' },
  { value: 'good', label: 'Good' },
  { value: 'yellow', label: 'Re-review' },
  { value: 'bad', label: 'Bad' },
];

const STATUS_OPTIONS: SegmentOption<ReviewStatus>[] = [
  { value: 'good', icon: 'check', hint: { label: 'Good', description: 'The sprite is right' } },
  { value: 'yellow', icon: 'circle-dot', hint: { label: 'Re-review', description: 'Look at this one again' } },
  { value: 'neutral', icon: 'circle', hint: { label: 'Unchecked', description: 'Not reviewed yet' } },
  { value: 'bad', icon: 'x', hint: { label: 'Bad', description: 'The sprite is wrong' } },
];

export { FILTER_OPTIONS, LABEL_STYLES, MODES, NONE_LABEL, S, STATUS_OPTIONS };
