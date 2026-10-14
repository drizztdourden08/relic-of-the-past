/* @layer renderer-components @kind logic */
import { evaluatePositionalSample } from './evaluate-positional-sample';
import type { SampleParams } from './positional-capture.type';
import { toInputItem } from './to-input-item';
import { trimTargetsToDevice } from './trim-targets-to-device';

const processPositionalSample = (params: SampleParams): void => {
  const { refs, sample, onAnswer, onItemsChange } = params;
  refs.latestSampleRef.current = sample;
  if (!refs.trimmedRef.current) {
    refs.trimmedRef.current = true;
    refs.targetsRef.current = trimTargetsToDevice(refs.targetsRef.current, sample);
    onItemsChange(refs.targetsRef.current.map(toInputItem));
  }
  evaluatePositionalSample({ refs, sample, onAnswer });
};

export { processPositionalSample };
