/* @layer renderer-components @kind constants */
import type { CSSProperties } from 'react';

const COPIED_TOAST: CSSProperties = { position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)', background: 'var(--c-secondary)', color: 'var(--c-text)', padding: '4px 12px', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', pointerEvents: 'none', zIndex: 8 };

const SCREEN_TILES = 64;
const TILE_PX = 8;
const SCREEN_PX = 512;
const SCREEN_GRID_MASK = 7;
const TOOLTIP_OFFSET_X = 14;
const TOOLTIP_OFFSET_Y = -60;
const DEBUG_TOOLTIP_TOP = 40;

export { COPIED_TOAST, SCREEN_TILES, TILE_PX, SCREEN_PX, SCREEN_GRID_MASK, TOOLTIP_OFFSET_X, TOOLTIP_OFFSET_Y, DEBUG_TOOLTIP_TOP };
