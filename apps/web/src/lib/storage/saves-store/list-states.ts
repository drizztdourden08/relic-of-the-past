/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';

const listStates = (p: string): Promise<number[]> => saves.listStates(platformFiles(), p);

export { listStates };
