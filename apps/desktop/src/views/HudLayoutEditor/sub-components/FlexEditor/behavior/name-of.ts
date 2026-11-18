/* @layer renderer-components @kind logic */
import type { FlexActionContext } from '../FlexEditor.type';

const nameOf = (ctx: FlexActionContext, index: number): string =>
  ctx.container.children[index]?.id ?? ctx.t('hud-editor:flex.item', { n: index + 1 });

export { nameOf };
