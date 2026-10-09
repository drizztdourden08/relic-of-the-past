/* @layer renderer-components @kind constants */
import { find } from '@shared/game/data';
import { spriteFilename } from '@shared/game/logic/queries/item-sprites';

const ALL_ITEMS = find('item', () => true).map(item => ({
  id: item.id,
  name: item.name,
  file: spriteFilename(item.spriteId) ?? '',
}));

export { ALL_ITEMS };
