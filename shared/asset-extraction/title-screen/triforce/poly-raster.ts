/* @layer shared-asset-extraction @kind logic */
/**
 * The polyhedral engine's face filler (Polyhedral_DrawFace and its helpers in
 * core/zelda3/src/poly.c), kept to the same integer widths so its edges land on the
 * same pixels. It writes 4bpp sprite tiles into a WRAM-shaped buffer at 0xe800, the
 * block the NMI copies to VRAM 0x5800.
 */

const u8 = (v: number): number => v & 0xff;
const u16 = (v: number): number => v & 0xffff;

/** The span masks of the left and right partial bytes of a line, doubled for two bitplanes. */
const leftMask = (k: number): number => (0xff >> k) * 0x101;
const rightMask = (k: number): number => ((0xff << (7 - k)) & 0xff) * 0x101;

/** kPoly_RasterColors: every bitplane byte full where colour |c| has that bit set. */
const planesOf = (c: number): [number, number] => {
  const plane = (bit: number): number => (c & (1 << bit) ? 0xff : 0) << ((bit & 1) * 8);
  return [plane(0) | plane(1), plane(2) | plane(3)];
};

interface Edge { cur: number; y: number; trig: number; target: number; frac: number; step: number; idx: number }

interface Raster {
  ram: Uint8Array;
  xy: number[];
  steps: number;
  dst: number;
  color: [number, number];
  left: Edge;
  right: Edge;
}

const word = (ram: Uint8Array, a: number): number => ram[a & 0xffff] | (ram[(a + 1) & 0xffff] << 8);
const setWord = (ram: Uint8Array, a: number, v: number): void => {
  ram[a & 0xffff] = v & 0xff;
  ram[(a + 1) & 0xffff] = (v >> 8) & 0xff;
};
const blend = (ram: Uint8Array, a: number, color: number, mask: number): void =>
  setWord(ram, a, word(ram, a) ^ ((word(ram, a) ^ color) & mask));

const fillLine = (r: Raster): void => {
  const left = leftMask((r.left.frac >> 8) & 7);
  const right = rightMask((r.right.frac >> 8) & 7);
  const from = (r.left.frac >> 8) & 0x38;
  let d0 = (r.right.frac >> 8) & 0x38;
  let ptr = r.dst + d0 * 4;
  const [c0, c1] = r.color;
  d0 -= from;
  if (d0 === 0) {
    blend(r.ram, ptr, c0, left & right);
    blend(r.ram, ptr + 16, c1, left & right);
    return;
  }
  if (d0 < 0) return;
  let n = d0 >> 3;
  blend(r.ram, ptr, c0, right);
  blend(r.ram, ptr + 16, c1, right);
  ptr -= 0x20;
  while (--n) {
    setWord(r.ram, ptr, c0);
    setWord(r.ram, ptr + 16, c1);
    ptr -= 0x20;
  }
  blend(r.ram, ptr, c0, left);
  blend(r.ram, ptr + 16, c1, left);
};

/** Polyhedral_SetLeft / SetRight: find the next vertex down this side. True ends the face. */
const nextEdge = (r: Raster, e: Edge, step: (idx: number) => number): boolean => {
  let i: number;
  for (;;) {
    r.steps = u8(r.steps - 1);
    if (r.steps & 0x80) return true;
    i = step(e.idx);
    if (r.xy[i] < e.y) return true;
    if (r.xy[i] !== e.y) break;
    e.cur = r.xy[i - 1];
    e.idx = i;
  }
  e.trig = r.xy[i];
  e.target = r.xy[i - 1];
  e.idx = i;
  const u = e.target - e.cur;
  const t = Math.floor(((Math.abs(u) & 0xff) << 8) / u8(e.trig - e.y));
  e.frac = u16((e.cur << 8) | 0x80);
  e.step = u16(u < 0 ? -t : t);
  return false;
};

const stepLeft = (r: Raster) => (idx: number): number => (idx - 2 === 0 ? r.xy[0] : idx - 2);
const stepRight = (r: Raster) => (idx: number): number => (idx === r.xy[0] ? 0 : idx) + 2;

const rowAddress = (y: number): number =>
  u16(0xe800 + (((y & 0x38) ^ (y & 0x20 ? 0x24 : 0)) << 6) + (y & 7) * 2);

const nextRow = (dst: number): number => {
  if ((dst & 0xff) !== 0xe) return u16(dst + 2);
  const a = u8((dst >> 8) + 2);
  return (a ^ (a & 8 ? 0 : 0x19)) << 8;
};

/** Fills one convex face given as poly_xy_coords (count*2, then x,y pairs) in colour |c|. */
const drawFace = (ram: Uint8Array, xy: number[], c: number): void => {
  let n = xy[0];
  let minY = xy[n];
  let minIdx = n;
  while ((n -= 2)) if (xy[n] < minY) { minY = xy[n]; minIdx = n; }
  const edge = (): Edge => ({ cur: xy[minIdx - 1], y: xy[minIdx], trig: 0, target: 0, frac: 0, step: 0, idx: minIdx });
  const r: Raster = { ram, xy, steps: u8(xy[0] >> 1), dst: rowAddress(minY), color: planesOf(c), left: edge(), right: edge() };
  if (nextEdge(r, r.left, stepLeft(r)) || nextEdge(r, r.right, stepRight(r))) return;
  for (;;) {
    fillLine(r);
    r.dst = nextRow(r.dst);
    for (const [e, step] of [[r.left, stepLeft(r)], [r.right, stepRight(r)]] as const) {
      if (e.y === e.trig) {
        e.cur = e.target;
        if (nextEdge(r, e, step)) return;
      }
      e.y = u8(e.y + 1);
    }
    r.left.frac = u16(r.left.frac + r.left.step);
    r.right.frac = u16(r.right.frac + r.right.step);
  }
};

export { drawFace };
