/* @layer renderer-components @kind logic */
import type { LineAdvance } from '@shared/game/language';
import type { DialogueLineAttrs } from './line-attrs.type';

const attrsForLine = (advance: LineAdvance, endsBox: boolean): DialogueLineAttrs => {
  if (advance === null) return { advanceKind: null, advanceRow: null, endsBox };
  if (advance.kind === 'scroll') return { advanceKind: 'scroll', advanceRow: null, endsBox };
  return { advanceKind: 'row', advanceRow: advance.row, endsBox };
};

export { attrsForLine };
