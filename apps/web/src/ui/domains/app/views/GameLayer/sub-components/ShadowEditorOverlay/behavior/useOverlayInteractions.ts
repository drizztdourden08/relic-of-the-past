/* @layer renderer-components @kind hook */
import { useState } from 'react';
import { createMouseHandlers } from './mouse-handlers';
import type { HandlerDeps } from './mouse-handlers';

type InteractionDeps = Omit<HandlerDeps, 'setCursor'>;

/** Owns the cursor state and builds the canvas mouse handlers. */
const useOverlayInteractions = (deps: InteractionDeps) => {
  const [cursor, setCursor] = useState<string>('default');
  const handlers = createMouseHandlers({ ...deps, setCursor });
  return { ...handlers, cursor };
};

export type { InteractionDeps };
export { useOverlayInteractions };
