/* @layer renderer-lib @kind logic */
import { isZip, unzip } from '@rotp/roms';
import type { MsuResult } from '@app/ipc/msu-contract';
import { platformFiles } from '../platform-files';
import { errorMessage } from '../error-message';
import { runImportJob } from '../import-job';
import type { ImportReport } from '../import-job';
import type { MsuTrackEntry } from './msu-store.type';
import { MSU_TRACK_PATTERN, NO_TRACKS_ERROR } from './msu-store.constants';

const resolveTracks = async (bytes: Uint8Array, name: string): Promise<MsuTrackEntry[]> => {
  if (isZip(bytes)) return (await unzip(bytes)).filter((e) => MSU_TRACK_PATTERN.test(e.name));
  return MSU_TRACK_PATTERN.test(name) ? [{ name, bytes }] : [];
};

const install = async (pack: string, tracks: MsuTrackEntry[], report: ImportReport): Promise<MsuResult> => {
  if (tracks.length === 0) return { success: false, error: NO_TRACKS_ERROR };
  let copied = 0;
  for (const t of tracks) {
    await platformFiles().writeBytes(`msu/${pack}/${t.name}`, t.bytes);
    copied += 1;
    report.count('copy', copied, tracks.length);
  }
  return { success: true, fileCount: tracks.length };
};

const failureOf = (result: MsuResult): string | null => (result.success ? null : (result.error ?? null));

const installMsuTracks = async (pack: string, read: (report: ImportReport) => Promise<{ bytes: Uint8Array; name: string }>): Promise<MsuResult> => {
  try {
    return await runImportJob({
      kind: 'msu',
      title: 'Importing a music pack',
      work: async (report) => {
        const { bytes, name } = await read(report);
        return install(pack, await resolveTracks(bytes, name), report);
      },
      failureOf,
    });
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
};

export { installMsuTracks };
