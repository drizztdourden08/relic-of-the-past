/* @layer shared-hud @kind constants */
import type { HudClusterReveal } from '../types/hud-layout';

const REVEALS: readonly HudClusterReveal[] = ['always', 'on-change', 'never'];

const SCREEN_LOCKED = [
  'size', 'min', 'max', 'margin', 'scale', 'place', 'order', 'alignSelf', 'justifySelf', 'dimWhenEmpty',
] as const;

const LAYOUT_KEYS = ['id', 'name', 'builtIn', 'basedOn', 'glyphPack', 'inGameplay', 'screen'] as const;

export { LAYOUT_KEYS, REVEALS, SCREEN_LOCKED };
