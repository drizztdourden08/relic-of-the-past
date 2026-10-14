/* @layer shared-asset-extraction @kind logic */
import { appendCommand } from './append-command';
import { createByteCursor } from './create-byte-cursor';
import { END_MARKER } from './lz-decompress.constants';
import type { GetByteFn } from './lz-decompress.type';
import { readCommandHeader } from './read-command-header';

function decompress(
  ea: number,
  getByte: GetByteFn,
  offsetIsBe?: boolean,
): Buffer;
function decompress(
  ea: number,
  getByte: GetByteFn,
  offsetIsBe: boolean,
  returnLength: true,
): [Buffer, number];
function decompress(
  ea: number,
  getByte: GetByteFn,
  offsetIsBe = true,
  returnLength = false,
): Buffer | [Buffer, number] {
  const result: number[] = [];
  const cursor = createByteCursor(ea, getByte);
  for (let first = cursor.next(); first !== END_MARKER; first = cursor.next()) {
    const { cmd, count } = readCommandHeader(first, cursor);
    appendCommand({ cmd, count, result, cursor, offsetIsBe });
  }
  const buf = Buffer.from(result);
  return returnLength ? [buf, cursor.consumed()] : buf;
}

export { decompress };
