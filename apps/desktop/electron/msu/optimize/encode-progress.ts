/* @layer electron-main @kind logic */
import type { ToolStream } from '@drizztdourden08/brock-tools/main';
import { MICROSECONDS_PER_SECOND, OUT_TIME_LINE } from './flac-encode.constants';

const encodeProgress = (durationSeconds: number, onProgress: (fraction: number) => void) =>
  (line: string, stream: ToolStream): void => {
    if (stream !== 'stdout') return;
    const match = OUT_TIME_LINE.exec(line.trim());
    if (!match?.[1]) return;
    const seconds = Number(match[1]) / MICROSECONDS_PER_SECOND;
    onProgress(Math.min(1, Math.max(0, seconds / durationSeconds)));
  };

export { encodeProgress };
