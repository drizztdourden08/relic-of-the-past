/* @layer shared-asset-extraction @kind logic */
/**
 * SNES LZ decompression, the 7-mode format the game uses for compressed assets. Ported from
 * util.py `decomp()`; must produce byte-identical output.
 *
 * Command byte: top 3 bits != 0b111: cmd = bits[7:5], length = bits[4:0] + 1.
 * Top 3 bits == 0b111: cmd = (byte << 3) & 0xE0, length = ((byte & 3) << 8 | next) + 1.
 * 0xFF = end of stream.
 *
 * Commands: 0x00 literal (copy N bytes from stream); 0x20 memset (repeat 1 byte N times);
 * 0x40 memset16 (alternate 2 bytes for N bytes); 0x60 increment (start at byte, +1 each copy);
 * 0x80/0xA0/0xC0 copy N bytes from earlier in output (offset from stream, big-endian default).
 */
import type { RomData } from '../rom/rom-types';

/** Callback type matching Python's get_byte pattern */
type GetByteFn = (addr: number) => number;

/**
 * Decompress from SNES address `ea`. `offsetIsBe` (default true): copy offsets are big-endian.
 * `returnLength`: return a [data, compressedLength] tuple.
 */
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

  // Inline reader with bank-crossing logic (matches Python's Reader class)
  let addr = ea;
  const nextByte = (): number => {
        const r = getByte(addr);
        addr += 1;
        if ((addr & 0xffff) === 0) {
          addr += 0x8000;
        }
        return r;
      };

  while (true) {
    const b = nextByte();
    if (b === 0xff) {
      const buf = Buffer.from(result);
      if (returnLength) {
        return [buf, (addr - ea) & 0x7fff];
      }
      return buf;
    }

    let lx: number;
    let cmd: number;

    if ((b & 0xe0) !== 0xe0) {
      lx = b & 0x1f;
      cmd = b & 0xe0;
    } else {
      cmd = (b << 3) & 0xe0;
      lx = ((b & 3) << 8) | nextByte();
    }
    lx += 1;

    if (cmd === 0x00) {
      // Literal: copy N bytes from stream
      for (let i = 0; i < lx; i++) {
        result.push(nextByte());
      }
    } else if (cmd & 0x80) {
      // Copy from output buffer
      let offs = nextByte() << 8;
      offs |= nextByte();
      if (!offsetIsBe) {
        offs = ((offs >>> 8) | ((offs & 0xff) << 8)) & 0xffff;
      }
      for (let i = 0; i < lx; i++) {
        result.push(result[offs]);
        offs += 1;
      }
    } else if ((cmd & 0x40) === 0) {
      // Memset: repeat single byte
      const fill = nextByte();
      for (let i = 0; i < lx; i++) {
        result.push(fill);
      }
    } else if ((cmd & 0x20) === 0) {
      // Memset16: alternate two bytes
      const b1 = nextByte();
      const b2 = nextByte();
      for (let i = 0; i < lx; i++) {
        if (i % 2 === 0) {
          result.push(b1);
        } else {
          result.push(b2);
        }
      }
    } else {
      // Increment: start at byte, increment each iteration
      let fill = nextByte();
      for (let i = 0; i < lx; i++) {
        result.push(fill);
        fill = (fill + 1) & 0xff;
      }
    }
  }
}

const decompressFromRom = (rom: RomData, ea: number, offsetIsBe = true): Buffer => {
  return decompress(ea, (addr) => rom.getByte(addr), offsetIsBe);
};

const decompressFromRomWithLength = (rom: RomData, ea: number, offsetIsBe = true): [Buffer, number] => {
  return decompress(ea, (addr) => rom.getByte(addr), offsetIsBe, true);
};

export { decompress, decompressFromRom, decompressFromRomWithLength };
export type { GetByteFn };
