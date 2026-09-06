/* @layer renderer-components @kind component */
/**
 * Modal overlay that captures the next key or gamepad button press.
 * Uses the shared InputManager's raw input events so every input source
 * (keyboard, Web Gamepad API, SDL3 controllers) works identically everywhere.
 */

import { useEffect, useState } from 'react';
import type { InputBinding } from '@shared/types/controls';
import { getInputManager } from '../../../../../../../lib/input/input-manager';
import { Portal } from '../../../../../../design-system/primitives/Portal';
import { Box } from '../../../../../../design-system/primitives/Box';
import './BindingListener.css';

const MODIFIER_CODES = new Set([
  'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight',
  'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight',
]);

interface BindingListenerProps {
  actionLabel: string;
  onCapture: (binding: InputBinding, sourceDeviceKey?: string, vendorId?: string | null, productId?: string | null) => void;
  onCancel: () => void;
}

const BindingListener = (props: BindingListenerProps) => {
  const { actionLabel, onCapture, onCancel } = props;
  const [canCancel, setCanCancel] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setCanCancel(true), 150);
    return () => clearTimeout(timeout);
  }, []);

  // Single unified listener, using InputManager's raw input events for ALL sources
  useEffect(() => {
    let cancelled = false;
    // Synchronous one-shot guard, deliberately NOT React state: a stick
    // pushed even slightly off-axis crosses two axes' press thresholds in the
    // very same animation frame, and RawInputDispatcher fires one `emit()`
    // per crossing, all synchronously, before React ever gets a chance to
    // flush the setListeningFor(null) that a first successful capture
    // schedules. Without this flag both events reach handleCapture while its
    // closed-over `listeningFor` is still the old truthy value, so the
    // second (often an incidental drift on the other axis) silently
    // overwrites the first, which is the exact way a rebind could end up pointing at
    // the wrong axis, or two different actions ending up bound identically.
    let captured = false;
    let unsub: (() => void) | null = null;

    // Keyboard: capture-phase handler for Escape + key capture (active immediately after delay)
    const handleKey = (e: KeyboardEvent) => {
      if (cancelled) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        onCancel();
        return;
      }
      // Delete/Backspace clears the binding
      if (e.code === 'Delete' || e.code === 'Backspace') {
        if (captured) return;
        captured = true;
        onCapture({ type: 'none' }, 'keyboard');
        return;
      }
      // Ignore bare modifier presses and wait for the actual key
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

    // Wait 200ms before subscribing to avoid capturing stale input
    const timeout = setTimeout(() => {
      if (cancelled) return;
      window.addEventListener('keydown', handleKey, true);
      // Gamepad + HID: subscribe to InputManager's raw input stream
      unsub = getInputManager().onRawInput((event) => {
        if (cancelled || captured) return;
        captured = true;
        onCapture(event.binding, event.sourceDeviceKey, event.vendorId, event.productId);
      });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      window.removeEventListener('keydown', handleKey, true);
      if (unsub) unsub();
    };
  }, [onCapture, onCancel]);

  return (
    <Portal layer="modal">
      <Box className="binding-listener-backdrop" onClick={() => canCancel && onCancel()}>
        <Box className="binding-listener" onClick={(e) => e.stopPropagation()}>
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
}

export { BindingListener };
