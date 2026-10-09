/* @layer renderer-lib @kind logic */
import { isZip, unzip } from '@rotp/roms';
import type { MsuResult } from '@app/ipc/msu-contract';
import { platformFiles } from '../platform-files';
import { errorMessage } from '../error-message';
import type { MsuTrackEntry } from './msu-store.type';
import { MSU_TRACK_PATTERN, NO_TRACKS_ERROR } from './msu-store.constants';
import { emitMsuProgress } from './emit-msu-progress';

const resolveTracks = async (bytes: Uint8Array, name: string): Promise<MsuTrackEntry[]> => {
  if (isZip(bytes)) return (await unzip(bytes)).filter((e) => MSU_TRACK_PATTERN.test(e.name));
  return MSU_TRACK_PATTERN.test(name) ? [{ name, bytes }] : [];
};

const install = async (pack: string, tracks: MsuTrackEntry[]): Promise<MsuResult> => {
  if (tracks.length === 0) {
    emitMsuProgress('error', undefined, undefined, NO_TRACKS_ERROR);
    return { success: false, error: NO_TRACKS_ERROR };
  }
  let copied = 0;
  for (const t of tracks) {
    await platformFiles().writeBytes(`msu/${pack}/${t.name}`, t.bytes);
    copied += 1;
    emitMsuProgress('copy', copied, tracks.length);
  }
  emitMsuProgress('done');
  return { success: true, fileCount: tracks.length };
};

const installMsuTracks = async (pack: string, read: () => Promise<{ bytes: Uint8Array; name: string }>): Promise<MsuResult> => {
  try {
    const { bytes, name } = await read();
    return await install(pack, await resolveTracks(bytes, name));
  } catch (err) {
    const msg = errorMessage(err);
    emitMsuProgress('error', undefined, undefined, msg);
    return { success: false, error: msg };
  }
};

export { installMsuTracks };
