/* @layer renderer-components @kind logic */
import { MANY } from './flex-actions.constants';
import type { FlexActionContext } from '../../FlexEditor.type';

const moveRun = (ctx: FlexActionContext, from: number, to: number) => (): void => {
  if (ctx.selection.kind !== 'items') return;
  if (ctx.selection.indices.length !== 1) { ctx.edits.refuse(MANY); return; }
  ctx.edits.move(from, to);
  ctx.edits.setSelection({ kind: 'items', indices: [to], anchor: to });
};

export { moveRun };
