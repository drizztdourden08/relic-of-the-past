/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { controllerInputStore } from '@app/input/controller-input-store';
import { STICK_CENTERED } from '../stick-calibration.constants';
import type { StickQuad } from '../stick-calibration.type';

const sameQuad = (a: StickQuad, b: StickQuad): boolean => a.lx === b.lx && a.ly === b.ly && a.rx === b.rx && a.ry === b.ry;

const useRawSticks = (deviceKey?: string): StickQuad => {
  const [raw, setRaw] = useState<StickQuad>(STICK_CENTERED);

  useEffect(() => controllerInputStore.onInput((state) => {
    if (deviceKey && state.deviceKey !== deviceKey) return;
    if (!state.rawSticks) return;
    const [lx, ly, rx, ry] = state.rawSticks;
    const next = { lx, ly, rx, ry };
    setRaw((prev) => (sameQuad(prev, next) ? prev : next));
  }), [deviceKey]);

  return raw;
};

export { useRawSticks };
