/* @layer renderer-components @kind constants */
import { find } from '@rotp/game-data';
import { spriteFilename } from '@rotp/game-data';

const ALL_ITEMS = find('item', () => true).map(item => ({
  id: item.id,
  name: item.name,
  file: spriteFilename(item.spriteId) ?? '',
}));

export { ALL_ITEMS };
