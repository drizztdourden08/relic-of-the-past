/* @layer renderer-lib @kind logic */
import * as sprites from '@shared/storage/sprites';
import { platformFiles } from '../platform-files';

const readForeignIcons = (romFile: string): Promise<Uint8Array | null> => sprites.readForeignIcons(platformFiles(), romFile);

export { readForeignIcons };
