/* @layer electron-main @kind logic */
import { FLAC_COMPRESSION_LEVEL, PROGRESS_ARGS } from './flac-encode.constants';
import type { EncodeRequest } from './flac-encode.type';

const encodeArgs = (request: EncodeRequest): string[] => {
  const { inputArgs, sourcePath, destPath, seconds } = request;
  return [
    '-hide_banner', '-v', 'error', '-y',
    ...PROGRESS_ARGS,
    ...inputArgs,
    ...(seconds === undefined ? [] : ['-t', String(seconds)]),
    '-i', sourcePath,
    '-map', '0:a:0',
    '-c:a', 'flac',
    '-compression_level', FLAC_COMPRESSION_LEVEL,
    destPath,
  ];
};

export { encodeArgs };
