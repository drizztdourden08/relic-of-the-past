/* @layer renderer-components @kind logic */
import { nodeName } from '@app/hud-layout-editing/node-name';
import type { FlexActionContext } from '../FlexEditor.type';

const nameOf = (ctx: FlexActionContext, index: number): string => {
  const id = ctx.container.children[index]?.id;
  return id ? nodeName(id, ctx.t) : ctx.t('hud-editor:flex.item', { n: index + 1 });
};

export { nameOf };
