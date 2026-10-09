/* @layer renderer-lib @kind logic */
import { msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const listMsuPackEntries = (pack: string) => msu.listPackEntries(platformFiles(), pack);

export { listMsuPackEntries };
