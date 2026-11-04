/* @layer renderer-lib @kind logic */
import { alttpMsuConfig, msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const listMsuPackEntries = (pack: string) => msu.listPackEntries(alttpMsuConfig, platformFiles(), pack);

export { listMsuPackEntries };
