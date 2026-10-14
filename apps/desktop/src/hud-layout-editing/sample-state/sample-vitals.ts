/* @layer renderer-components @kind logic */
import { SAMPLE_ITEMS } from './sample-state.constants';
import { SILVER_ARROW_TIER } from '../sample-state.constants';
import type { SampleVitalsInput, Vitals } from './sample-vitals.type';

const sampleVitals = (input: SampleVitalsInput): Vitals => {
  const { counters, live, armor, items, heartMode, showMaxInYellow } = input;
  return {
    healthCurrent: counters.healthCurrent,
    healthCapacity: counters.healthCapacity,
    heartMode,
    armor: live ? armor : 0,
    magic: counters.magicPower,
    halfMagic: counters.halfMagic,
    bombs: counters.bombs,
    maxBombs: counters.maxBombs,
    arrows: counters.arrows,
    maxArrows: counters.maxArrows,
    keys: counters.keys,
    hasSilverArrows: (live ? items[0] ?? 0 : SAMPLE_ITEMS[0]) >= SILVER_ARROW_TIER,
    rupees: counters.rupees,
    maxRupees: counters.maxRupees,
    showMaxInYellow,
  };
};

export { sampleVitals };
