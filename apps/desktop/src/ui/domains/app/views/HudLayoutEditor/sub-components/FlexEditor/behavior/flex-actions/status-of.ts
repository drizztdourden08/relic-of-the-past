/* @layer renderer-components @kind logic */
import { nameOf } from './name-of';
import type { FlexActionContext } from '../../FlexEditor.type';

const statusOf = (ctx: FlexActionContext): string => {
  const total = ctx.container.children.length;
  const what = `${total} ${total === 1 ? 'child' : 'children'}`;
  if (ctx.selection.kind === 'none') return `${what}, none selected`;
  const { indices } = ctx.selection;
  if (indices.length === 1) {
    const at = Math.min(...indices);
    return `item ${at + 1} of ${total} is ${nameOf(ctx, at)}`;
  }
  return `${indices.length} of ${total} are ${indices.map((i) => nameOf(ctx, i)).join(', ')}`;
};

export { statusOf };
