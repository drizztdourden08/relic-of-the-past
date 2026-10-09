/* @layer renderer-widgets @kind constants */
import type { CSSProperties } from 'react';

const IL: Record<string, CSSProperties> = {
  wrapRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  bigEmoji: { fontSize: 18 },
  subTitle: { fontSize: 10, color: 'var(--c-text-dim)', marginBottom: 4, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 },
  firstSubTitle: { fontSize: 10, color: 'var(--c-text-dim)', marginBottom: 4, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  none: { fontSize: 10, color: 'var(--c-text-muted)' },
  screenLabel: { fontSize: 10, color: 'var(--c-info)', marginTop: 2 },
  holeGraphic: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 48, flexShrink: 0, background: 'repeating-linear-gradient(45deg, var(--c-gold) 0px, var(--c-gold) 2px, transparent 2px, transparent 4px)', borderRadius: 'var(--r-sm)' },
};

export { IL };
