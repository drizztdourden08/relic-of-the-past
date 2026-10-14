/* @layer renderer-components @kind component */
import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { Portal, Box } from '@drizztdourden08/tessera/primitives';
import { CANCEL_ARM_DELAY_MS } from './controls.constants';
import { useListenForBinding } from './useListenForBinding';
import type { BindingListenerProps } from './controls.type';
import './BindingListener.css';

const stopPropagation = (e: MouseEvent) => e.stopPropagation();

const BindingListener = (props: BindingListenerProps) => {
  const { actionLabel, onCapture, onCancel } = props;
  const [canCancel, setCanCancel] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setCanCancel(true), CANCEL_ARM_DELAY_MS);
    return () => clearTimeout(timeout);
  }, []);

  useListenForBinding({ onCapture, onCancel });

  const handleBackdropClick = useCallback(() => { if (canCancel) onCancel(); }, [canCancel, onCancel]);

  return (
    <Portal layer="modal">
      <Box className="binding-listener-backdrop" onClick={handleBackdropClick}>
        <Box className="binding-listener" onClick={stopPropagation}>
          <Box className="binding-listener__prompt">
            Press a key, button, or move a stick for
          </Box>
          <Box className="binding-listener__label">{actionLabel}</Box>
          <Box className="binding-listener__hint">
            Press Escape to cancel · Delete to clear
          </Box>
        </Box>
      </Box>
    </Portal>
  );
};

export { BindingListener };
