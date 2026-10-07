/* @layer renderer-other @kind hook */
/**
 * The modifier keys the dock layout reacts to while they are held: Alt peeks
 * (every docked pane folds to its title strip and the game takes the room),
 * Shift makes a drop swap panes, Ctrl makes a drop land as an overlay. Keys
 * typed into a field never count, and a window blur releases everything, since
 * the keyup for a key held across an app switch never arrives.
 */
import { useEffect, useMemo, useState } from 'react';
import type { DragModifiers } from '@ds/composites/DockLayout/DockLayout.type';
import { useWidgetLayoutStore } from '@app/stores/widget-layout-store';

const isTyping = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
};

const useHeldActions = (): DragModifiers => {
  const setPeek = useWidgetLayoutStore((s) => s.setPeek);
  const [shiftHeld, setShiftHeld] = useState(false);
  const [ctrlHeld, setCtrlHeld] = useState(false);

  useEffect(() => {
    const release = () => {
      setPeek(false);
      setShiftHeld(false);
      setCtrlHeld(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || isTyping(e.target)) return;
      if (e.key === 'Alt') setPeek(true);
      if (e.key === 'Shift') setShiftHeld(true);
      if (e.key === 'Control') setCtrlHeld(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setPeek(false);
      if (e.key === 'Shift') setShiftHeld(false);
      if (e.key === 'Control') setCtrlHeld(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', release);
      release();
    };
  }, [setPeek]);

  return useMemo(() => ({ swap: shiftHeld, overlay: ctrlHeld }), [shiftHeld, ctrlHeld]);
};

export { useHeldActions };
