/* @layer tests @kind test */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { listVersions } from '../../apps/desktop/electron/updater/version-feed';

const asset = (version: string) => ({
  Version: version,
  Type: 'Full',
  FileName: `relic-of-the-past-${version}-full.nupkg`,
  Size: 100,
});

describe('version picker release feeds', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('finds an older published pre-release missing from the newest stable index', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('/releases?')) return {
        ok: true,
        json: async () => [
          { tag_name: 'v0.19.2', draft: false, prerelease: false,
            assets: [{ name: 'releases.win.json', browser_download_url: 'https://example.test/stable' }] },
          { tag_name: 'v0.20.7', draft: false, prerelease: true,
            assets: [{ name: 'releases.win.json', browser_download_url: 'https://example.test/pre' }] },
        ],
      };
      return { ok: true, json: async () => ({ Assets: url.endsWith('/stable')
        ? [asset('0.19.2'), asset('0.19.1')]
        : [asset('0.20.7'), asset('0.19.0')] }) };
    });
    vi.stubGlobal('fetch', fetchMock);

    expect((await listVersions('0.19.1', false)).map((v) => v.version)).toEqual(['0.19.2']);
    const optedIn = await listVersions('0.19.1', true);
    expect(optedIn.map((v) => v.version)).toEqual(['0.20.7', '0.19.2']);
    expect(optedIn[0].prerelease).toBe(true);
    expect(optedIn[0].plan.target.FileName).toBe('relic-of-the-past-0.20.7-full.nupkg');
  });
});
