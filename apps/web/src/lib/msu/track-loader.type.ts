/* @layer renderer-lib @kind types */
import type { DecodedAudio } from './decode/decode-audio-file';

interface LoadedLayer {
  layerIndex: number;
  files: DecodedAudio[];
  fileNames: string[];
}

type LoadBytes = (fileName: string) => Promise<Uint8Array | null>;

export type { LoadedLayer, LoadBytes };
