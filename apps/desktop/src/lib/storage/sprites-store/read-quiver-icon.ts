/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const readQuiverIcon = (romFile: string): Promise<Uint8Array | null> => sprites.readQuiverIcon(platformFiles(), romFile);

export { readQuiverIcon };
