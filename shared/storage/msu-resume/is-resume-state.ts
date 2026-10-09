/* @layer shared-storage @kind logic */
import type { MsuResumeState } from '@shared/types/msu-manifest';

const isResumeState = (value: unknown): value is MsuResumeState => {
  const s = value as MsuResumeState | null;
  return !!s && typeof s.trackNum === 'number' && !!s.layers && typeof s.layers === 'object';
};

export { isResumeState };
