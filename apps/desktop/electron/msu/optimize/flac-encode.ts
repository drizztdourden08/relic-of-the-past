/* @layer electron-main @kind logic */
/**
 * The encoder invocation, in one place, so the slice that MEASURES a file and the run that
 * CONVERTS it cannot disagree.
 *
 * That is the whole reason this is a module and not two argument lists: the preview's promise
 * is only worth anything if the compression level it measured is the level the conversion
 * then uses. Change one and both change.
 *
 * `-map 0:a:0` takes the first audio stream and nothing else, so an mp3 carrying cover art
 * does not turn into a file with a video stream in it. The sample format is left to the
 * encoder to negotiate rather than pinned to 16-bit: a 24-bit source pinned down to 16 would
 * quietly stop being a lossless copy of itself.
 */
import { ENCODE_TIMEOUT_MS, runTool } from '../../tools/ffmpeg-run';

/**
 * Encoder effort, 0-12. The default 5 is the balance point — the levels above it buy a couple
 * of percent for several times the time, which a pack of a hundred files pays for once per file.
 */
const FLAC_COMPRESSION_LEVEL = '5';

interface EncodeRequest {
  /** Input options the source needs before `-i` (see ./audio-source). */
  inputArgs: string[];
  sourcePath: string;
  destPath: string;
  /** Seconds to read, for a measuring slice. Omitted for a full conversion. */
  seconds?: number;
}

const encodeArgs = (request: EncodeRequest): string[] => {
  const { inputArgs, sourcePath, destPath, seconds } = request;
  return [
    '-hide_banner', '-v', 'error', '-y',
    ...inputArgs,
    ...(seconds === undefined ? [] : ['-t', String(seconds)]),
    '-i', sourcePath,
    '-map', '0:a:0',
    '-c:a', 'flac',
    '-compression_level', FLAC_COMPRESSION_LEVEL,
    destPath,
  ];
};

/** Throws with whatever the encoder said, so a failure names the file's own problem. */
const encodeToTarget = async (ffmpegPath: string, request: EncodeRequest): Promise<void> => {
  // The encode budget, not the probe one: a long track legitimately runs for minutes.
  const result = await runTool(ffmpegPath, encodeArgs(request), ENCODE_TIMEOUT_MS);
  if (result.code === 0) return;
  throw new Error(result.stderr.trim().split('\n').pop() ?? `encoder exited with ${result.code}`);
};

export { FLAC_COMPRESSION_LEVEL, encodeArgs, encodeToTarget };
export type { EncodeRequest };
