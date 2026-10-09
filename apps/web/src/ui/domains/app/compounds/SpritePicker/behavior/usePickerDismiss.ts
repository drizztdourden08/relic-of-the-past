/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef } from 'react';
import { useEscapeStack } from '@drizztdourden08/tessera/primitives';
import type { UsePickerDismissParams } from './usePickerDismiss.type';

const usePickerDismiss = (params: UsePickerDismissParams): void => {
  const { open, anchorRef, panelRef, onClose } = params;
  const latest = useRef(onClose);
  latest.current = onClose;
  const close = useCallback(() => latest.current(), []);

  useEffect(() => {
    if (!open) return undefined;
    const press = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('mousedown', press);
    return () => document.removeEventListener('mousedown', press);
  }, [open, anchorRef, panelRef, close]);

  useEscapeStack({ active: open, level: 'popover', onEscape: close });
};

export { usePickerDismiss };
