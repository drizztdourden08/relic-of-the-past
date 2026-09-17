/* @layer renderer-widgets @kind hook */
/**
 * Binds a control to the pointer hint: spread the returned handlers on the element and the
 * hint names the control and lists its inputs while the pointer is over it.
 */
import { useContext, useMemo } from 'react';
import type { MouseEvent } from 'react';
import { PointerHintContext } from './pointer-hint-context';
import type { ControlHint } from '../sub-components/ControlGlyph.type';

const usePointerHintTarget = (title: string, items: readonly ControlHint[]) => {
  const { show, move, hide } = useContext(PointerHintContext);
  return useMemo(() => ({
    onMouseEnter: (e: MouseEvent) => show(title, items, e),
    onMouseMove: (e: MouseEvent) => move(e),
    onMouseLeave: () => hide(),
  }), [show, move, hide, title, items]);
};

export { usePointerHintTarget };
