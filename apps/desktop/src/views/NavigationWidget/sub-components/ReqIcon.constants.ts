/* @layer renderer-widgets @kind constants */
import type { CSSProperties } from 'react';

const IL: Record<string, CSSProperties> = {
  emoji: { fontSize: 12, marginRight: 2 },
  chip: { fontSize: 10, color: 'var(--c-warning)', marginRight: 4, background: 'var(--c-warning-soft)', padding: '0 3px', borderRadius: 'var(--radius-sm)' },
};

const REQ_ICONS: Partial<Record<string, { icon: string; color: string }>> = {
  flippers: { icon: '🏊', color: '#48f' },
  hammer: { icon: '🔨', color: '#fa4' },
  boots: { icon: '👢', color: '#c84' },
  glove: { icon: '🧤', color: '#a8f' },
  hookshot: { icon: '🪝', color: '#8af' },
  bomb: { icon: '💣', color: '#f44' },
  firerod: { icon: '🔥', color: '#f84' },
  icerod: { icon: '❄️', color: '#4cf' },
  lamp: { icon: '🔦', color: '#fc4' },
  mirror: { icon: '🪞', color: '#c8f' },
  sword: { icon: '⚔️', color: '#aaf' },
  bow: { icon: '🏹', color: '#8c4' },
};

export { IL, REQ_ICONS };
