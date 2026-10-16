/* @layer renderer-components @kind logic */
import { ROW_ATTRIBUTE } from '../SaveList.constants';

const rowIdOf = (target: EventTarget | null): string | null =>
  (target instanceof Element ? target.closest(`[${ROW_ATTRIBUTE}]`)?.getAttribute(ROW_ATTRIBUTE) ?? null : null);

export { rowIdOf };
