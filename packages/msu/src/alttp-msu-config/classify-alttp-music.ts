/* @layer shared-storage @kind logic */
import type { MusicCommand } from '@drizztdourden08/brock-msu';
import { ALTTP_CHIP_ONLY_MASK, ALTTP_FADES } from './alttp-msu-config.constants';

const classifyAlttpMusic = (ctrl: number): MusicCommand => {
  const fade = ALTTP_FADES[ctrl];
  if (fade) return { kind: 'fade', target: fade.target, step: fade.step };
  if ((ctrl & ALTTP_CHIP_ONLY_MASK) === ALTTP_CHIP_ONLY_MASK) return { kind: 'ignore' };
  return { kind: 'track', track: ctrl };
};

export { classifyAlttpMusic };
