/* @layer renderer-lib @kind logic */
import * as msu from '@shared/storage/msu';
import { platformFiles } from '../platform-files';

const getMsuPackFiles = (pack: string) => msu.getPackFiles(platformFiles(), pack);

export { getMsuPackFiles };
