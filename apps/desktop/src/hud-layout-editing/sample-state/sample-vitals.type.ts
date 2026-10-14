/* @layer renderer-components @kind types */
import type { HudNodeContent } from '@app/compounds/HudNodeRenderer';
import type { SAMPLE_HUD } from './sample-state.constants';

type Vitals = HudNodeContent['vitals'];

interface SampleVitalsInput {
  counters: typeof SAMPLE_HUD;
  live: boolean;
  armor: number;
  items: readonly number[];
  heartMode: Vitals['heartMode'];
  showMaxInYellow: boolean;
}

export type { SampleVitalsInput, Vitals };
