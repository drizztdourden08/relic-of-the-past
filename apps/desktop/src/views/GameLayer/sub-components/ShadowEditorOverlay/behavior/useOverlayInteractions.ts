/* @layer renderer-components @kind hook */
import { useState } from 'react';
import { createMouseHandlers } from './mouse-handlers';
import type { InteractionDeps } from './overlay.type';

const useOverlayInteractions = (deps: InteractionDeps) => {
  const [cursor, setCursor] = useState<string>('default');
  const handlers = createMouseHandlers({ ...deps, setCursor });
  return { ...handlers, cursor };
};

export { useOverlayInteractions };
