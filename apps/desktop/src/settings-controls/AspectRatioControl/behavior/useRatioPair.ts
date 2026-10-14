/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { validateCustomRatio, effectiveCustomRatio } from '@rotp/game-core';
import type { RatioPairParams } from './useRatioPair.type';

const useRatioPair = (params: RatioPairParams) => {
  const { customW, customH, renderIntoNotch, wKey, hKey, onChange } = params;
  const eff = effectiveCustomRatio(customW, customH, renderIntoNotch);
  const [w, setW] = useState(eff.w);
  const [h, setH] = useState(eff.h);
  useEffect(() => { setW(eff.w); setH(eff.h); }, [eff.w, eff.h]);

  const commit = useCallback((nw: number, nh: number) => {
    setW(nw); setH(nh);
    if (validateCustomRatio(nw, nh).valid) onChange({ [wKey]: nw, [hKey]: nh });
  }, [onChange, wKey, hKey]);

  const handleWidth = useCallback((n: number) => commit(n, h), [commit, h]);
  const handleHeight = useCallback((n: number) => commit(w, n), [commit, w]);

  return { w, h, check: validateCustomRatio(w, h), handleWidth, handleHeight };
};

export { useRatioPair };
