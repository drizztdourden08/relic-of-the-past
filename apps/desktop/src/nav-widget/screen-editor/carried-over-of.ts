/* @layer renderer-widgets @kind logic */
import type { ScreenDraft } from './screen-editor.type';

const carriedOverOf = (existing: ScreenDraft['existing']) => ({
  nav: existing?.nav,
  triggerIds: existing?.triggerIds,
  spawns: existing?.spawns,
  review: existing?.review,
});

export { carriedOverOf };
