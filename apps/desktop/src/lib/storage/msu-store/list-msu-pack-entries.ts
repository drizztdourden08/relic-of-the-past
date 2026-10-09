/* @layer renderer-lib @kind logic */
import * as msu from '@shared/storage/msu';
import { platformFiles } from '../platform-files';

const listMsuPackEntries = (pack: string) => msu.listPackEntries(platformFiles(), pack);

export { listMsuPackEntries };
