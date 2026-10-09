/* @layer renderer-widgets @kind hook */
import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useEscapeStack } from '@drizztdourden08/tessera/primitives';

const useDismiss = (ref: RefObject<HTMLElement | null>, anchor: HTMLElement | null, onClose: () => void): void => {
  useEscapeStack({ level: 'popover', onEscape: onClose });

  useEffect(() => {
    const onPress = (e: PointerEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || anchor?.contains(target)) return;
      onClose();
    };
    document.addEventListener('pointerdown', onPress, true);
    return () => document.removeEventListener('pointerdown', onPress, true);
  }, [ref, anchor, onClose]);
};

export { useDismiss };
