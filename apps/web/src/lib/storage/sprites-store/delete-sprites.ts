/* @layer renderer-lib @kind logic */
import * as sprites from '@shared/storage/sprites';
import { platformFiles } from '../platform-files';

const deleteSprites = (romFile: string) => sprites.remove(platformFiles(), romFile);

export { deleteSprites };
