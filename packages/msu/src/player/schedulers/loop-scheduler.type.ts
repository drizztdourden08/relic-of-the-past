/* @layer renderer-lib @kind types */
import type { LayerContext, LiveVoice } from './scheduler.type';

type LoopOrder = 'sequential' | 'random' | 'single';

interface LoopState {
  voices: LiveVoice[];
  fileIndex: number;
  handoff: ReturnType<typeof setTimeout> | null;
}

interface LoopRun {
  ctx: LayerContext;
  order: LoopOrder;
  crossfade: number;
  state: LoopState;
}

export type { LoopOrder, LoopRun, LoopState };
