/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { drawFace } from './poly-raster';
import { signed8 } from './poly-model';
import type { PolyModel, PolyPose } from './poly-model';
import type { ProjectedVertices, Rotation } from './poly-render.type';
import { BUFFER_BASE, BUFFER_BYTES, COSINE_OFFSET, RAM_BYTES } from './poly-render.constants';

const u8 = (v: number): number => v & 0xff;
const u16 = (v: number): number => v & 0xffff;
const s16 = (v: number): number => (v << 16) >> 16;

const divide = (a: number, b: number): number => {
  const negative = (a & 0x8000) !== 0;
  let num = negative ? u16(-a) : a;
  let den = b;
  while (den >= 256) { den >>= 1; num >>= 1; }
  const q = Math.floor(num / den);
  return u16(negative ? -q : q);
};

const sinCosAt = (model: PolyModel, index: number): number => itemAt(model.sinCos, index, 'Triforce sine table');

const rotationOf = (model: PolyModel, pose: PolyPose): Rotation => {
  const sinA = sinCosAt(model, pose.a), cosA = sinCosAt(model, pose.a + COSINE_OFFSET);
  const sinB = sinCosAt(model, pose.b), cosB = sinCosAt(model, pose.b + COSINE_OFFSET);
  const term = (p: number, q: number): number => s16(u16(((p * signed8(q)) >> 8) << 2));
  return { sinA, cosA, sinB, cosB, e0: term(sinB, sinA), e1: term(cosB, cosA), e2: term(cosB, sinA), e3: term(sinB, cosA) };
};

const projectVertices = (model: PolyModel, pose: PolyPose): ProjectedVertices => {
  const r = rotationOf(model, pose);
  const depth = u16(pose.distance * 2 + 0x80);
  const xs: number[] = [], ys: number[] = [];
  model.vertices.forEach(([vx, vy, vz], i) => {
    const x = vz, y = vy, z = vx;
    const f0 = u16(r.cosB * z - r.sinB * x);
    const f1 = u16(r.e0 * z + r.cosA * y + r.e2 * x);
    const f2 = u16(((r.e3 * z) >> 8) - ((r.sinA * y) >> 8) + ((r.e1 * x) >> 8) + depth);
    xs[i] = u8(pose.baseX + divide(f0, f2));
    ys[i] = u8(pose.baseY - divide(f1, f2));
  });
  return { xs, ys };
};

const crossProduct = (xy: readonly number[]): number => {
  const at = (i: number): number => itemAt(xy, i, 'Triforce face outline');
  const t = u16((at(3) - at(1)) * signed8(at(6) - at(4)));
  return u16(t - (at(5) - at(3)) * signed8(at(4) - at(2)));
};

const shadeOf = (cross: number): number => {
  const a = u8((cross << 1) >> 8);
  return Math.min(7, Math.max(1, a));
};

const renderPolyhedron = (model: PolyModel, pose: PolyPose): Uint8Array => {
  const ram = new Uint8Array(RAM_BYTES);
  const { xs, ys } = projectVertices(model, pose);
  const faceAt = (i: number): number => itemAt(model.faces, i, 'Triforce face list');
  let p = 0;
  for (let f = 0; f < model.faceCount; f += 1) {
    const n = faceAt(p);
    const xy = [n * 2];
    for (let i = 0; i < n; i += 1) {
      const v = faceAt(p + 1 + i);
      xy.push(itemAt(xs, v, 'Triforce vertex x'), itemAt(ys, v, 'Triforce vertex y'));
    }
    p += n + 2;
    const cross = crossProduct(xy);
    if (s16(cross) > 0) drawFace(ram, xy, shadeOf(cross));
  }
  return ram.slice(BUFFER_BASE, BUFFER_BASE + BUFFER_BYTES);
};

export { renderPolyhedron };
