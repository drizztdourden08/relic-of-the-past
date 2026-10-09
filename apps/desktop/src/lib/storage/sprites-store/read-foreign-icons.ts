/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const readForeignIcons = (romFile: string): Promise<Uint8Array | null> => sprites.readForeignIcons(platformFiles(), romFile);

export { readForeignIcons };
