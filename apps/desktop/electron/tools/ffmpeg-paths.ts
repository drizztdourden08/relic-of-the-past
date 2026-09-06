/* @layer electron-main @kind logic */
/**
 * Where the optional ffmpeg binaries live, and which platforms we install for.
 *
 * The tool dir hangs off the app's own data root, so an isolated `--user-data` launch
 * gets its own copy and the real profile is never touched.
 */
import { join } from 'path';
import { getUserDataPath } from '../lib/paths';

/** Both binaries we keep; everything else in the archive is discarded. */
type FfmpegBinaries = { ffmpegPath: string; ffprobePath: string };

const isWindows = (): boolean => process.platform === 'win32';
const isLinux = (): boolean => process.platform === 'linux';

/** True on the one platform we download a build for. */
const canDownload = (): boolean => isWindows();

const exeName = (stem: string): string => (isWindows() ? `${stem}.exe` : stem);

/** The install destination, `<data>/tools/ffmpeg`. */
const ffmpegToolDir = (): string => getUserDataPath('tools', 'ffmpeg');

/** The two paths a managed install occupies (whether or not they exist yet). */
const managedBinaries = (): FfmpegBinaries => ({
  ffmpegPath: join(ffmpegToolDir(), exeName('ffmpeg')),
  ffprobePath: join(ffmpegToolDir(), exeName('ffprobe')),
});

export { canDownload, exeName, ffmpegToolDir, isLinux, isWindows, managedBinaries };
export type { FfmpegBinaries };
