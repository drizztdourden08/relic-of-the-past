/* @layer shared-store @kind types */
/**
 * Random access to one pack file, so a reader can take the parts it needs without holding the
 * whole file. A local pack answers from its bytes; a pack in the store answers with ranged
 * requests to a signed link.
 */

type RangeReader = {
  /** Total size of the pack file. */
  bytes: number;
  /** The bytes from `start` for `length`. */
  range: (start: number, length: number) => Promise<Uint8Array>;
};

export type { RangeReader };
