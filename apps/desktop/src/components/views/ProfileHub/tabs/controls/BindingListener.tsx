/**
 * BindingListener — modal overlay that captures the next key or gamepad button press.
 * Uses the shared InputManager's raw input events so every input source
 * (keyboard, Web Gamepad API, WebHID) works identically everywhere.
 */

import { useEffect, useState } from 'react';
import type { InputBinding, SnesButton } from '@shared/types/controls';
import { SNES_BUTTON_LABELS } from '@shared/types/controls';
import { getInputManager } from '../../../../../lib/game/input-manager';
import './BindingListener.css';

interface BindingListenerProps {
  snesButton: SnesButton;
  onCapture: (binding: InputBinding, sourceDeviceKey?: string, vendorId?: string | null, productId?: string | null) => void;
  onCancel: () => void;
}

export function BindingListener({ snesButton, onCapture, onCancel }: BindingListenerProps): JSX.Element {
  const label = SNES_BUTTON_LABELS[snesButton];
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
      onCapture({ type: 'keyboard', code: e.code }, 'keyboard');
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
          Press a key or button for
        </div>
        <div className="binding-listener__label">{label}</div>
        <div className="binding-listener__hint">
          Press Escape to cancel
        </div>
      </div>
    </div>
  );
}
