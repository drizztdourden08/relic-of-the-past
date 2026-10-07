/* @layer renderer-widgets @kind logic */
/**
 * The hint that follows the pointer: one per tab, shown by whichever control the pointer is
 * over. The context carries the show / move / hide calls; the layer that draws it and the
 * hook that binds a control both read it.
 */
import { createContext } from 'react';
import type { MouseEvent } from 'react';
import type { ControlHint } from '../sub-components/ControlGlyph.type';

type PointerHintState = {
  title: string;
  items: readonly ControlHint[];
  /** Pointer position relative to the tab root. */
  x: number;
  y: number;
};

type PointerHintApi = {
  show: (title: string, items: readonly ControlHint[], e: MouseEvent) => void;
  move: (e: MouseEvent) => void;
  hide: () => void;
};

const noop = (): void => undefined;

const PointerHintContext = createContext<PointerHintApi>({ show: noop, move: noop, hide: noop });

export { PointerHintContext };
export type { PointerHintApi, PointerHintState };
