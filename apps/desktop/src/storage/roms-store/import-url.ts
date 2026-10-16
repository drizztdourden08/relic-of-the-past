/* @layer renderer-lib @kind logic */
import type { RomImportResult, RomKind } from '@rotp/roms';
import { fetchToBytes } from '@app/download/download';
import { lastPathSegment } from '../last-path-segment';
import { importRomJob } from './import-rom-job';

const fallbackName = (kind: RomKind): string => (kind === 'gba-alttp' ? 'rom.gba' : 'rom.sfc');

const nameFromUrl = (url: string, kind: RomKind): string => lastPathSegment(url) || fallbackName(kind);

const importUrl = (url: string, kind: RomKind = 'snes-alttp'): Promise<RomImportResult> =>
  importRomJob(kind, async (report) => ({
    fileName: nameFromUrl(url, kind),
    bytes: await fetchToBytes(url, (loaded, total) => report.count('download', loaded, total ?? undefined)),
  }));

export { importUrl };
