/* @layer renderer-widgets @kind hook */
/**
 * Closes a floating box on a press outside it and its anchor, or on Escape. The press is
 * caught in the capture phase so a click that lands on another control closes this box
 * before that control opens its own.
 */
import { useEffect } from 'react';
import type { RefObject } from 'react';

const useDismiss = (ref: RefObject<HTMLElement | null>, anchor: HTMLElement | null, onClose: () => void): void => {
  useEffect(() => {
    const onPress = (e: PointerEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || anchor?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('pointerdown', onPress, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPress, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, anchor, onClose]);
};

export { useDismiss };
