/* @layer shared-hud @kind types */
import type { HudElementSpec } from '../../types/hud-node';

type FixedSizeType = Exclude<HudElementSpec['type'], 'shape' | 'sprite' | 'text'>;

export type { FixedSizeType };
