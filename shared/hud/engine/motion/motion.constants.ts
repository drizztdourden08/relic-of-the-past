/* @layer shared-hud @kind constants */
import type { HudAnimatableProperty } from '../../../types/hud/hud-motion';

const REFLOW_ANIMATABLE_PROPERTIES: ReadonlySet<HudAnimatableProperty> = new Set(['width', 'height']);

export { REFLOW_ANIMATABLE_PROPERTIES };
