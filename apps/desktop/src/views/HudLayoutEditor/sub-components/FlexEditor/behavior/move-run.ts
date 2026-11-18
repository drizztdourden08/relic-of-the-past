/* @layer renderer-components @kind logic */
import type { FlexActionContext } from '../FlexEditor.type';

const moveRun = (ctx: FlexActionContext, from: number, to: number) => (): void => {
  if (ctx.selection.kind !== 'items') return;
  if (ctx.selection.indices.length !== 1) { ctx.edits.refuse(ctx.t('hud-editor:flex.refuse.many')); return; }
  ctx.edits.move(from, to);
  ctx.edits.setSelection({ kind: 'items', indices: [to], anchor: to });
};

export { moveRun };
