/* @layer renderer-components @kind logic */
import { isPrimaryModifier } from '@shared/platform';
import { runBetween } from './run-between';
import type { OsKind } from '@shared/platform';
import type { IndexRun, PressModifiers } from './index-selection.type';

const nextIndexRun = (
  held: IndexRun | null, index: number, event: PressModifiers, os: OsKind,
): IndexRun | null => {
  if (held && event.shiftKey) {
    return { indices: runBetween(held.anchor, index), anchor: held.anchor };
  }
  if (held && isPrimaryModifier(event, os)) {
    const indices = held.indices.includes(index)
      ? held.indices.filter((i) => i !== index)
      : [...held.indices, index];
    return indices.length > 0 ? { indices, anchor: index } : null;
  }
  return { indices: [index], anchor: index };
};

export { nextIndexRun };
