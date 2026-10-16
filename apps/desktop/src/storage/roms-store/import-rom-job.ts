/* @layer renderer-lib @kind logic */
import type { RomBytes, RomImportResult, RomKind } from '@rotp/roms';
import { importRomBytes } from '../rom-files';
import { platformFiles } from '../platform-files';
import { runImportJob } from '../import-job';
import type { ImportReport } from '../import-job';

const failureOf = (result: RomImportResult): string | null => (result.success ? null : (result.error ?? 'Import failed'));

const importRomJob = (kind: RomKind, work: (report: ImportReport) => Promise<RomBytes>): Promise<RomImportResult> =>
  runImportJob({
    kind: 'rom',
    title: 'Importing a ROM',
    work: async (report) => importRomBytes(platformFiles(), await work(report), kind, (phase) => report.phase(phase)),
    failureOf,
  });

export { importRomJob };
