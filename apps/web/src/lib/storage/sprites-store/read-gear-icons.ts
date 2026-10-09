/* @layer renderer-lib @kind logic */
import * as sprites from '@shared/storage/sprites';
import { platformFiles } from '../platform-files';

const readGearIcons = (romFile: string): Promise<Uint8Array | null> => sprites.readGearIcons(platformFiles(), romFile);

export { readGearIcons };
