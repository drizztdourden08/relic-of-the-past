/* @layer tests @kind test */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';
import { compileAlttpAssetSet } from '../../shared/asset-extraction/compile-alttp-asset-set';
import { compileResources } from '../../shared/asset-extraction/compile-resources';
import { loadGbaAlttpRomFromBuffer } from '../../shared/asset-extraction/rom/gba-rom';
import { loadRomFromBuffer } from '../../shared/asset-extraction/rom/rom-loader';

const snesPath = resolve('test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');
const gbaPath = resolve('test-roms', 'Legend of Zelda, The - A Link to the Past & Four Swords (USA).gba');
const integration = existsSync(snesPath) && existsSync(gbaPath) ? it : it.skip;

describe('multi-source asset aggregation', () => {
  // Full compile options on purpose. The cheap variant (skipDialogue/skipMusic) proved
  // byte-identity only for a blob the app never actually ships, which left the real
  // question — does adding a second source perturb the base at all — unanswered.
  integration('leaves the base byte-identical whether or not a supplement is present', async () => {
    const snes = loadRomFromBuffer(readFileSync(snesPath));
    const gba = loadGbaAlttpRomFromBuffer(readFileSync(gbaPath));

    const baseOnly = await compileAlttpAssetSet({ snes });
    const combined = await compileAlttpAssetSet({ snes, gbaAlttp: gba });

    expect(baseOnly.base).toEqual(compileResources(snes));
    expect(combined.base).toEqual(baseOnly.base);
  });

  integration('reports the supplement as its own container, and its failure as data', async () => {
    const snes = loadRomFromBuffer(readFileSync(snesPath));
    const gba = loadGbaAlttpRomFromBuffer(readFileSync(gbaPath));

    const baseOnly = await compileAlttpAssetSet({ snes }, { skipDialogue: true, skipMusic: true });
    expect(baseOnly.supplements).toEqual([]);

    // Without an engine to solve room streams the supplement must fail as data — reason and
    // all — while the base stays untouched. The full solve path is covered by the supplement
    // test; this one is about the error boundary.
    const combined = await compileAlttpAssetSet({ snes, gbaAlttp: gba }, { skipDialogue: true, skipMusic: true });
    expect(combined.supplements).toHaveLength(1);
    const [supplement] = combined.supplements;
    expect(supplement.id).toBe('gba-alttp');
    expect(supplement.ok).toBe(false);
    if (!supplement.ok) expect(supplement.reason).toContain('streams');
    expect(combined.base).toEqual(baseOnly.base);
  });
});
