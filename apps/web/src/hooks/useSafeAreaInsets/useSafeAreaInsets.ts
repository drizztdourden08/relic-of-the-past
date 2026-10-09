/* @layer renderer-other @kind hook */
import { useEffect, useState } from 'react';
import type { SafeAreaInsets } from './use-safe-area-insets.type';
import { ZERO } from './use-safe-area-insets.constants';

const readInsets = (): SafeAreaInsets => {
  const s = getComputedStyle(document.documentElement);
  const px = (name: string) => parseFloat(s.getPropertyValue(name)) || 0;
  const top = px('--sai-top');
  const right = px('--sai-right');
  const bottom = px('--sai-bottom');
  const left = px('--sai-left');
  return { top, right, bottom, left, hasNotch: Math.max(top, right, bottom, left) > 0 };
};

const useSafeAreaInsets = (): SafeAreaInsets => {
  const [insets, setInsets] = useState<SafeAreaInsets>(ZERO);

  useEffect(() => {
    const update = () => setInsets(readInsets());
    update();
    window.addEventListener('rotpinsets', update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('rotpinsets', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return insets;
};

export { useSafeAreaInsets };
