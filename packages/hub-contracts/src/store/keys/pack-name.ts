/* @layer shared-store @kind logic */
import type { Container, StoreItem } from '../types';

const packName = (item: Pick<StoreItem, 'slug'>, v: { semver: string; container: Container }): string =>
  `${item.slug}-${v.semver}.${v.container}`;

export { packName };
