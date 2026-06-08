/* @layer renderer-components @kind hook */
/** While the overlay is open, ESC or any non-slot button cancels it. */
import { useEffect } from 'react';
import { getInputManager } from '../../../../../../lib/game';

const useCancelOnOtherInput = (open: boolean, close: () => void) => {
  useEffect(() => {
    if (!open) return;
    const inputMgr = getInputManager();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      const mappings = inputMgr.getFunctionMappings();
      const isSlotKey = mappings.some(m =>
        m.binding.type === 'keyboard' &&
        m.binding.code === e.code &&
        (m.action.startsWith('load-state-') || m.action.startsWith('save-state-'))
      );
      if (!isSlotKey) close();
    };
    window.addEventListener('keydown', onKeyDown);

    const mappings = inputMgr.getFunctionMappings();
    const slotButtonIndices = new Set<number>();
    for (const m of mappings) {
      if (m.binding.type === 'gamepad-button' && (m.action.startsWith('load-state-') || m.action.startsWith('save-state-'))) {
        slotButtonIndices.add(m.binding.index);
      }
    }

    const prevButtons = new Map<string, boolean[]>();
    const unsub = inputMgr.onInputState((hidStates, gamepads) => {
      for (const [key, state] of hidStates) {
        const prev = prevButtons.get(key) ?? [];
        for (let i = 0; i < state.buttons.length; i++) {
          if (state.buttons[i] && !prev[i] && !slotButtonIndices.has(i)) {
            close();
            return;
          }
        }
        prevButtons.set(key, [...state.buttons]);
      }
      for (const gp of gamepads) {
        const gpKey = `gp-${gp.index}`;
        const prev = prevButtons.get(gpKey) ?? [];
        for (let i = 0; i < gp.buttons.length; i++) {
          if (gp.buttons[i].pressed && !prev[i] && !slotButtonIndices.has(i)) {
            close();
            return;
          }
        }
        prevButtons.set(gpKey, gp.buttons.map(b => b.pressed));
      }
    });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      unsub();
    };
  }, [open, close]);
};

export { useCancelOnOtherInput };
