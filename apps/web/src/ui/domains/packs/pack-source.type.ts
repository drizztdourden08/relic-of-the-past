/* @layer renderer-components @kind types */
/**
 * Where a pack's bytes come from, for the read-only pack viewers. The app adapts its local file
 * store to it and the store adapts a signed link, so a viewer never knows where the pack lives.
 * Same shape as the shared `RangeReader`, so a source goes straight into the shared zip readers.
 */

type PackSource = {
  /** Total size of the pack file. */
  bytes: number;
  /** The bytes from `start` for `length`. A local pack reads its file; the store fetches a range. */
  range: (start: number, length: number) => Promise<Uint8Array>;
};

export type { PackSource };
