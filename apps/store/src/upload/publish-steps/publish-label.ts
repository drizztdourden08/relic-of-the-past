/* @layer store-site @kind logic */
import type { PublishTarget } from '../publish-target.type';

const publishLabel = (target: PublishTarget, n: number | null): string => {
  if (n !== null) return `${target.itemName}, v${n}`;
  return target.pack ? `${target.itemName}, new version` : `${target.itemName}, listing`;
};

export { publishLabel };
