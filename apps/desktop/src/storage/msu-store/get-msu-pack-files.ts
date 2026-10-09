/* @layer renderer-lib @kind logic */
import { msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const getMsuPackFiles = (pack: string) => msu.getPackFiles(platformFiles(), pack);

export { getMsuPackFiles };
