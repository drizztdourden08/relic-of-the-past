/* @layer renderer-widgets @kind hook */
import { useContext, useMemo } from 'react';
import type { MouseEvent } from 'react';
import { PointerHintContext } from './pointer-hint-context';
import type { ControlHint } from '../sub-components/ControlHint.type';

const usePointerHintTarget = (title: string, items: readonly ControlHint[]) => {
  const { show, move, hide } = useContext(PointerHintContext);
  return useMemo(() => ({
    onMouseEnter: (e: MouseEvent) => show(title, items, e),
    onMouseMove: (e: MouseEvent) => move(e),
    onMouseLeave: () => hide(),
  }), [show, move, hide, title, items]);
};

export { usePointerHintTarget };
