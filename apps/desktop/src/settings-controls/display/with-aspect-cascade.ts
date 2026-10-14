/* @layer renderer-app @kind logic */
import type { GameSettings } from '@rotp/features';
import { REQUIRES_LINEAR, REQUIRES_ULTRAWIDE, TALL_PRESET_VALUES } from './display.constants';

const turnedOff = (patch: Partial<GameSettings>, key: 'linearWorldTilemap' | 'ultrawideRendering' | 'tallRendering'): boolean =>
  key in patch && patch[key] === false;

const linearOffCascade = (current: GameSettings): Partial<GameSettings> => {
  const wide = REQUIRES_LINEAR.has(current.aspectRatio) || REQUIRES_ULTRAWIDE.has(current.aspectRatio);
  return { ...(wide ? { aspectRatio: '16:9' } : {}), ultrawideRendering: false, tallRendering: false };
};

const withAspectCascade = <P extends Partial<GameSettings>>(patch: P, current: GameSettings): P => {
  const ratio = current.aspectRatio;
  return {
    ...(turnedOff(patch, 'linearWorldTilemap') ? linearOffCascade(current) : {}),
    ...(turnedOff(patch, 'ultrawideRendering') && REQUIRES_ULTRAWIDE.has(ratio) ? { aspectRatio: '21:9' } : {}),
    ...(turnedOff(patch, 'tallRendering') && TALL_PRESET_VALUES.has(ratio) ? { aspectRatio: '4:3' } : {}),
    ...patch,
  };
};

export { withAspectCascade };
