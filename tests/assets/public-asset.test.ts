/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import { publicAsset } from '../../apps/web/src/lib/assets/public-asset';

// Vitest runs with Vite's default BASE_URL of '/'. The contract under test is the
// normalization: any leading "/" or "./" is stripped before the base is applied,
// so the result never contains a doubled separator regardless of how callers write
// the path. In the packaged renderer BASE_URL is "./", yielding "./buttons/...".
describe('publicAsset', () => {
  it('joins BASE_URL with a clean path, stripping any leading slash or dot-slash', () => {
    const base = import.meta.env.BASE_URL;
    expect(publicAsset('buttons/xbox/a.svg')).toBe(`${base}buttons/xbox/a.svg`);
    expect(publicAsset('/buttons/xbox/a.svg')).toBe(`${base}buttons/xbox/a.svg`);
    expect(publicAsset('./buttons/xbox/a.svg')).toBe(`${base}buttons/xbox/a.svg`);
  });

  it('never produces a doubled separator', () => {
    expect(publicAsset('/buttons/x.svg')).not.toContain('//buttons');
  });
});
