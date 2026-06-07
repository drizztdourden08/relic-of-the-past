/* @layer renderer-components @kind component */
/**
 * BindingListener — modal overlay that captures the next key or gamepad button press.
 * Uses the shared InputManager's raw input events so every input source
 * (keyboard, Web Gamepad API, WebHID) works identically everywhere.
 */

import { useEffect, useState } from 'react';
import type { InputBinding } from '@shared/types/controls';
import { getInputManager } from '../../../../../lib/input/input-manager';
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

  // Single unified listener — uses InputManager's raw input events for ALL sources
  useEffect(() => {
    let cancelled = false;
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
        onCapture({ type: 'none' }, 'keyboard');
        return;
      }
      // Ignore bare modifier presses — wait for the actual key
      if (MODIFIER_CODES.has(e.code)) return;

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
        if (cancelled) return;
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
    <div className="binding-listener-backdrop" onClick={() => canCancel && onCancel()}>
      <div className="binding-listener" onClick={(e) => e.stopPropagation()}>
        <div className="binding-listener__prompt">
          Press a key, button, or move a stick for
        </div>
        <div className="binding-listener__label">{actionLabel}</div>
        <div className="binding-listener__hint">
          Press Escape to cancel · Delete to clear
        </div>
      </div>
    </div>
  );
}

export { BindingListener };
