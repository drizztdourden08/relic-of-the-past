/* @layer store-site @kind logic */
import type { PublishTarget } from '../publish-target.type';

const publishTitle = (target: PublishTarget): string =>
  (target.isNew || target.pack ? `Publishing ${target.itemName}` : `Updating ${target.itemName}`);

export { publishTitle };
