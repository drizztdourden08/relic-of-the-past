/* @layer renderer-lib @kind logic */
import * as sprites from '@shared/storage/sprites';
import { platformFiles } from '../platform-files';

const readQuiverIcon = (romFile: string): Promise<Uint8Array | null> => sprites.readQuiverIcon(platformFiles(), romFile);

export { readQuiverIcon };
