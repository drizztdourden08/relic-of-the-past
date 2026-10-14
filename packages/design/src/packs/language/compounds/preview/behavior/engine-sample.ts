/* @layer renderer-components @kind logic */
import { ENGINE_SAMPLES } from '@rotp/languages';

const engineSample = (key: string): string => {
  const sample = ENGINE_SAMPLES[key];
  if (sample === undefined) throw new Error(`No engine sample for ${key}`);
  return sample;
};

export { engineSample };
