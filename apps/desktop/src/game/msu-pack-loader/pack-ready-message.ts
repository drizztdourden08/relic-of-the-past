/* @layer bridge-wasm @kind logic */
import type { PackReadyMessageParams } from './pack-ready-message.type';

const packReadyMessage = ({ packName, manifest, audioFileCount, trackCount, isDeluxe }: PackReadyMessageParams): string => {
  const contents = manifest === null ? `${trackCount} tracks` : `${manifest.tracks.length} authored tracks, ${audioFileCount} files`;
  return `[MSU] Pack "${packName}" ready with ${contents}${isDeluxe ? ', extended numbering' : ''}`;
};

export { packReadyMessage };
