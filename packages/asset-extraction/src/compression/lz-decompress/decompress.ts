/* @layer shared-asset-extraction @kind logic */
import type { GetByteFn } from './lz-decompress.type';

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

  let addr = ea;
  const nextByteCrossingBanks = (): number => {
        const r = getByte(addr);
        addr += 1;
        if ((addr & 0xffff) === 0) {
          addr += 0x8000;
        }
        return r;
      };

  while (true) {
    const b = nextByteCrossingBanks();
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
      lx = ((b & 3) << 8) | nextByteCrossingBanks();
    }
    lx += 1;

    if (cmd === 0x00) {
      for (let i = 0; i < lx; i++) {
        result.push(nextByteCrossingBanks());
      }
    } else if (cmd & 0x80) {
      let offs = nextByteCrossingBanks() << 8;
      offs |= nextByteCrossingBanks();
      if (!offsetIsBe) {
        offs = ((offs >>> 8) | ((offs & 0xff) << 8)) & 0xffff;
      }
      for (let i = 0; i < lx; i++) {
        result.push(result[offs] ?? 0);
        offs += 1;
      }
    } else if ((cmd & 0x40) === 0) {
      const fill = nextByteCrossingBanks();
      for (let i = 0; i < lx; i++) {
        result.push(fill);
      }
    } else if ((cmd & 0x20) === 0) {
      const b1 = nextByteCrossingBanks();
      const b2 = nextByteCrossingBanks();
      for (let i = 0; i < lx; i++) {
        if (i % 2 === 0) {
          result.push(b1);
        } else {
          result.push(b2);
        }
      }
    } else {
      let fill = nextByteCrossingBanks();
      for (let i = 0; i < lx; i++) {
        result.push(fill);
        fill = (fill + 1) & 0xff;
      }
    }
  }
}

export { decompress };
