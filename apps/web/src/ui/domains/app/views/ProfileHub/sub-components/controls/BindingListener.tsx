/* @layer renderer-components @kind component */
import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import type { InputBinding } from '@shared/types/controls';
import { getInputManager } from '../../../../../../../lib/input/input-manager';
import { Portal, Box } from '@drizztdourden08/tessera/primitives';
import { CANCEL_ARM_DELAY_MS, LISTEN_ARM_DELAY_MS, MODIFIER_CODES } from './controls.constants';
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

  useEffect(() => {
    let cancelled = false;
    let captured = false;
    let unsub: (() => void) | null = null;

    const handleKey = (e: KeyboardEvent) => {
      if (cancelled) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        onCancel();
        return;
      }
      if (e.code === 'Delete' || e.code === 'Backspace') {
        if (captured) return;
        captured = true;
        onCapture({ type: 'none' }, 'keyboard');
        return;
      }
      if (MODIFIER_CODES.has(e.code)) return;
      if (captured) return;
      captured = true;

      const modifiers: { shift?: boolean; ctrl?: boolean; alt?: boolean } = {};
      if (e.shiftKey) modifiers.shift = true;
      if (e.ctrlKey) modifiers.ctrl = true;
      if (e.altKey) modifiers.alt = true;

      const binding: InputBinding = {
        type: 'keyboard',
        code: e.code,
        ...(Object.keys(modifiers).length > 0 ? { modifiers } : {}),
      };
      onCapture(binding, 'keyboard');
    };

    const timeout = setTimeout(() => {
      if (cancelled) return;
      window.addEventListener('keydown', handleKey, true);
      unsub = getInputManager().onRawInput((event) => {
        if (cancelled || captured) return;
        captured = true;
        onCapture(event.binding, event.sourceDeviceKey, event.vendorId, event.productId);
      });
    }, LISTEN_ARM_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      window.removeEventListener('keydown', handleKey, true);
      if (unsub) unsub();
    };
  }, [onCapture, onCancel]);

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
