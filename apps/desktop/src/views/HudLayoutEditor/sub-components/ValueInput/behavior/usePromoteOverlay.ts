/* @layer renderer-components @kind hook */
import { useLayoutEffect, useState } from 'react';
import { boxFor } from './box-for';
import type { RefObject } from 'react';
import type { PromoteBox, PromoteOverlay } from './usePromoteOverlay.type';

const applyBox = (root: HTMLElement, box: PromoteBox): (() => void) => {
  const entries = Object.entries(box);
  entries.forEach(([name, value]) => root.style.setProperty(name, value));
  return () => entries.forEach(([name]) => root.style.removeProperty(name));
};

const usePromoteOverlay = (
  focused: boolean, formula: boolean, inputRef: RefObject<HTMLInputElement | null>,
): PromoteOverlay => {
  const [measured, setMeasured] = useState(false);

  useLayoutEffect(() => {
    const root = inputRef.current?.closest('.hud-value-field');
    const box = focused && root instanceof HTMLElement ? boxFor(root) : null;
    setMeasured(box !== null);
    if (box === null || !(root instanceof HTMLElement)) return undefined;
    return applyBox(root, box);
  }, [focused, inputRef]);

  return { className: focused && formula && measured ? ' hud-value-field--wide' : '' };
};

export { usePromoteOverlay };
