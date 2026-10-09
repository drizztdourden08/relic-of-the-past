/* @layer renderer-lib @kind logic */
import { msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const readMsuLoopSample = (pack: string, fileName: string) => msu.readMsu1LoopSample(platformFiles(), pack, fileName);

export { readMsuLoopSample };
