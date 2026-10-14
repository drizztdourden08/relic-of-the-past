/* @layer renderer-components @kind logic */
import { detectAxisFired } from './detect-axis-fired';
import { detectFiredIndex } from './detect-fired-index';
import type { SampleParams } from './positional-capture.type';
import { settleRest } from './settle-rest';

const evaluatePositionalSample = (params: Omit<SampleParams, 'onItemsChange'>): void => {
  const { refs, sample, onAnswer } = params;
  if (!refs.inputPhaseActiveRef.current) return;
  const target = refs.targetsRef.current[refs.activeIndexRef.current];
  const baseline = refs.baselineRef.current;
  if (!target || !baseline) return;

  if (refs.awaitingRestRef.current) {
    settleRest(refs, baseline, sample);
    return;
  }

  const firedIndex = target.kind === 'button' ? detectFiredIndex(target, baseline, sample) : detectAxisFired(refs, baseline, sample);
  if (firedIndex !== null) onAnswer('captured', firedIndex);
};

export { evaluatePositionalSample };
