/**
 * BindingListener — modal overlay that captures the next key or gamepad button press.
 * Shows "Press a key or button for [SNES Label]..." and captures the first input.
 */

import { useEffect, useCallback } from 'react';
import type { InputBinding, SnesButton } from '@shared/types/controls';
import { SNES_BUTTON_LABELS } from '@shared/types/controls';
import './BindingListener.css';

interface BindingListenerProps {
  snesButton: SnesButton;
  onCapture: (binding: InputBinding) => void;
  onCancel: () => void;
}

export function BindingListener({ snesButton, onCapture, onCancel }: BindingListenerProps): JSX.Element {
  const label = SNES_BUTTON_LABELS[snesButton];

  const handleKey = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.code === 'Escape') {
      onCancel();
      return;
    }

    onCapture({
      type: 'keyboard',
      code: e.code,
    });
  }, [onCapture, onCancel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [handleKey]);

  // Poll gamepads for button press
  useEffect(() => {
    let running = true;

    const poll = () => {
      if (!running) return;

      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        if (!gp || !gp.connected) continue;

        // Check buttons
        for (let i = 0; i < gp.buttons.length; i++) {
          if (gp.buttons[i].pressed) {
            onCapture({
              type: 'gamepad-button',
              index: i,
            });
            running = false;
            return;
          }
        }

        // Check axes (dead zone threshold)
        for (let i = 0; i < gp.axes.length; i++) {
          const val = gp.axes[i];
          if (Math.abs(val) > 0.7) {
            onCapture({
              type: 'gamepad-axis',
              axisIndex: i,
              direction: val > 0 ? '+' : '-',
            });
            running = false;
            return;
          }
        }
      }

      requestAnimationFrame(poll);
    };

    // Small delay to avoid capturing the button press that opened this
    const timeout = setTimeout(() => {
      if (running) requestAnimationFrame(poll);
    }, 200);

    return () => {
      running = false;
      clearTimeout(timeout);
    };
  }, [onCapture]);

  return (
    <div className="binding-listener-backdrop" onClick={onCancel}>
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
