/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const readGearIcons = (romFile: string): Promise<Uint8Array | null> => sprites.readGearIcons(platformFiles(), romFile);

export { readGearIcons };
