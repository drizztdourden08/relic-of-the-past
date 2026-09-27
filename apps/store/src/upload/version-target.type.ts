/* @layer store-site @kind types */
import type { Container } from '@shared/store/types';

/** Where a pack upload lands: the next version of one item, with what the form asked. */
type VersionTarget = {
  itemId: string;
  /** The item's name, for the upload row. */
  itemName: string;
  semver: string;
  changelog: string;
  container: Container;
};

export type { VersionTarget };
