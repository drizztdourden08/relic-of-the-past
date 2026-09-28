/* @layer store-site @kind types */
import type { Container } from '@shared/store/types';

/** Where a pack upload lands: the next version of one item, which store-api numbers itself. */
type VersionTarget = {
  itemId: string;
  /** The item's name, for the upload row. */
  itemName: string;
  changelog: string;
  container: Container;
};

export type { VersionTarget };
