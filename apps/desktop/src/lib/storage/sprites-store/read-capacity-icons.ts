/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const readCapacityIcons = (romFile: string): Promise<Uint8Array | null> => sprites.readCapacityIcons(platformFiles(), romFile);

export { readCapacityIcons };
