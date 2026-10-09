/* @layer renderer-lib @kind logic */
import * as msu from '@shared/storage/msu';
import { platformFiles } from '../platform-files';

const readMsuLoopSample = (pack: string, fileName: string) => msu.readMsu1LoopSample(platformFiles(), pack, fileName);

export { readMsuLoopSample };
