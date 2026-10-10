/* @layer renderer-hud @kind constants */
import type { CSSProperties } from 'react';
import type { HudTransitionProperty } from '@rotp/hud';

const CSS_PROPERTIES: Record<HudTransitionProperty, readonly string[]> = {
  size: ['width', 'height'],
  position: ['left', 'top'],
  opacity: ['opacity'],
  scale: ['transform'],
  tint: ['filter'],
  color: ['filter'],
};

const PRE_ENTER: CSSProperties = { opacity: 0, transform: 'scale(0.85)' };
const POST_EXIT: CSSProperties = { opacity: 0, transform: 'scale(0.85)' };

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export { CSS_PROPERTIES, POST_EXIT, PRE_ENTER, REDUCED_MOTION_QUERY };
