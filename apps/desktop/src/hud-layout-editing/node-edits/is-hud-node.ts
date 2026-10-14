/* @layer renderer-components @kind logic */
import type { HudNode } from '@rotp/hud';

const isHudNode = (value: unknown): value is HudNode =>
  typeof value === 'object' && value !== null
  && 'id' in value && typeof value.id === 'string'
  && 'kind' in value && (value.kind === 'container' || value.kind === 'element');

export { isHudNode };
