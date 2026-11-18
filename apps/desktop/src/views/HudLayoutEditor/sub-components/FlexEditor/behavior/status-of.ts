/* @layer renderer-components @kind logic */
import { nameOf } from './name-of';
import type { FlexActionContext } from '../FlexEditor.type';

const statusOf = (ctx: FlexActionContext): string => {
  const { t } = ctx;
  const total = ctx.container.children.length;
  if (ctx.selection.kind === 'none') return t('hud-editor:flex.status.none', { total });
  const { indices } = ctx.selection;
  if (indices.length === 1) {
    const at = Math.min(...indices);
    return t('hud-editor:flex.status.one', { n: at + 1, total, name: nameOf(ctx, at) });
  }
  return t('hud-editor:flex.status.many', { count: indices.length, total, names: indices.map((i) => nameOf(ctx, i)).join(', ') });
};

export { statusOf };
