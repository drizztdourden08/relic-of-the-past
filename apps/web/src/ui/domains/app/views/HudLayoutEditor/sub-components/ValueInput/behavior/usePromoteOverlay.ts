/* @layer renderer-components @kind hook */
import { useLayoutEffect, useState } from 'react';
import { boxFor } from './box-for';
import type { CSSProperties, RefObject } from 'react';
import type { PromoteBox, PromoteOverlay } from './usePromoteOverlay.type';

const usePromoteOverlay = (
  focused: boolean, formula: boolean, inputRef: RefObject<HTMLInputElement | null>,
): PromoteOverlay => {
  const [box, setBox] = useState<PromoteBox | null>(null);

  useLayoutEffect(() => {
    if (!focused) {
      setBox(null);
      return;
    }
    const root = inputRef.current?.closest('.hud-value-field');
    if (root instanceof HTMLElement) setBox(boxFor(root));
  }, [focused, inputRef]);

  const on = focused && formula && box !== null;
  return {
    className: on ? ' hud-value-field--wide' : '',
    style: on ? (box as unknown as CSSProperties) : undefined,
  };
};

export { usePromoteOverlay };
