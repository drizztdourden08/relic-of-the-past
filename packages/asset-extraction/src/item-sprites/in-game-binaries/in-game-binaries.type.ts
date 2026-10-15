/* @layer shared-asset-extraction @kind types */
import type { ImageBuffer } from '../../graphics/png-writer';
import type { RGBA } from '../../graphics/palette';

type Pictures = ReadonlyMap<string, ImageBuffer>;
type PaletteRows = readonly (readonly RGBA[])[];
type Builder = (pictures: Pictures, paletteRows: PaletteRows) => Uint8Array | null;

interface InGameBinary {
  name: string;
  files: readonly string[];
  build: Builder;
  failure: string;
}

interface BinaryBuffers {
  buffers: { name: string; bytes: Uint8Array }[];
  errors: string[];
}

export type { BinaryBuffers, InGameBinary, PaletteRows, Pictures };
