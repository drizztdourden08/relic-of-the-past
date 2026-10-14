/* @layer renderer-components @kind types */
import type { Scope } from '../formula-scope';
import type { SectionKey as BoundSectionKey } from '../bound-values';
import type { HudContainer } from '@rotp/hud';

interface InspectorContext {
  isScreen: boolean;
  otherIds: string[];
  parent: HudContainer | null;
  insideRepeat: boolean;
  instances: readonly Scope[];
  counts: Partial<Record<BoundSectionKey, number>>;
  warnings: string[];
}

export type { InspectorContext };
