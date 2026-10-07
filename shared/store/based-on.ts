/* @layer shared-store @kind types */
/**
 * The credit a copy of an installed item keeps to the original: which store item, its name,
 * its author's display name, its licence and the version it was copied from. Every pack
 * format carries it the same way, as an optional `basedOn` in its own metadata.
 */

type BasedOn = {
  itemId: string;
  name: string;
  /** The author's display name. */
  author: string;
  /** A licence id from shared/store/licenses. */
  license: string;
  semver: string;
};

export type { BasedOn };
