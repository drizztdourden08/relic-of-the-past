/* @layer renderer-components @kind hook */
/** Tab toggles the debug-capture recorder, active only while allowDebugLogging is on. Ignored
 *  whenever an input, textarea, select, or contenteditable element has focus, so typing a
 *  setting search query or a bug-report field never gets hijacked. */
import { useEffect } from 'react';
import { useDebugCaptureStore } from '@app/stores/debug-capture-store';

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
};

const useDebugCaptureShortcut = (enabled: boolean): void => {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      useDebugCaptureStore.getState().toggle();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [enabled]);
};

export { useDebugCaptureShortcut };
