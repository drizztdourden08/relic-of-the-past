/* @layer renderer-components @kind logic */
import type { PadExtra } from '@drizztdourden08/brock-input';
import type { PressedModel } from './pressed-items.type';

const extrasModelOf = (extras: readonly PadExtra[]): PressedModel => ({
  items: extras.map((extra) => ({ id: extra.id, label: extra.label })),
  pressed: extras.filter((extra) => extra.pressed).map((extra) => extra.id),
});

export { extrasModelOf };
