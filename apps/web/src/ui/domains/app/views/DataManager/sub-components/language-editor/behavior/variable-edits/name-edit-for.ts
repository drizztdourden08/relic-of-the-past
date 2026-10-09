/* @layer renderer-components @kind logic */
import type { PauseLabelKey } from '@shared/game/language';
import type { NameEdit } from '../../language-editor.type';
import { bottleContentOf } from './bottle-content-of';
import { LABEL_PREFIX } from './variable-edits.constants';

const nameEditFor = (key: string, value: string): NameEdit => {
  const content = bottleContentOf(key);
  if (content !== null) return { group: 'bottles', key: content, value };
  if (key.startsWith(LABEL_PREFIX)) {
    return { group: 'labels', key: key.slice(LABEL_PREFIX.length) as PauseLabelKey, value };
  }
  return { group: 'items', key, value };
};

export { nameEditFor };
