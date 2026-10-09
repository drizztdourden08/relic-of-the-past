/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const deleteSprites = (romFile: string) => sprites.remove(platformFiles(), romFile);

export { deleteSprites };
