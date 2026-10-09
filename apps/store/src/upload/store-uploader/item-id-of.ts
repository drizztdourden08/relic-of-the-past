/* @layer store-site @kind logic */
import type { PublishTarget } from '../publish-target.type';

const itemIdOf = (target: PublishTarget): string => {
  if (!target.itemId) throw new Error('The listing was not created.');
  return target.itemId;
};

export { itemIdOf };
