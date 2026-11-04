/* @layer renderer-lib @kind logic */
import { alttpMsuConfig, msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const readMsuLoopSample = (pack: string, fileName: string) => msu.readMsu1LoopSample(alttpMsuConfig, platformFiles(), pack, fileName);

export { readMsuLoopSample };
