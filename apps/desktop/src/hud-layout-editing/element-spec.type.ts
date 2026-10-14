/* @layer renderer-components @kind types */
import type { HudElementSpec } from '@rotp/hud';

type SpecOf<T extends HudElementSpec['type']> = Extract<HudElementSpec, { type: T }>;

export type { SpecOf };
