/* @layer tests @kind test */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';
import { compileAlttpAssetSet } from '../../shared/asset-extraction/compile-alttp-asset-set';
import { compileGbaAlttpSupplement } from '../../shared/asset-extraction/compile-resources-gba-alttp';
import { compileResources } from '../../shared/asset-extraction/compile-resources';
import { loadGbaAlttpRomFromBuffer } from '../../shared/asset-extraction/rom/gba-rom';
import { loadRomFromBuffer } from '../../shared/asset-extraction/rom/rom-loader';

const snesPath = resolve('test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');
const gbaPath = resolve('test-roms', 'Legend of Zelda, The - A Link to the Past & Four Swords (USA).gba');
const integration = existsSync(snesPath) && existsSync(gbaPath) ? it : it.skip;

describe('ALttP multi-source asset aggregation', () => {
  integration('preserves the SNES base and attaches the optional GBA supplement', () => {
    const snes = loadRomFromBuffer(readFileSync(snesPath));
    const gba = loadGbaAlttpRomFromBuffer(readFileSync(gbaPath));
    const baseOnly = compileAlttpAssetSet({ snes }, { skipDialogue: true, skipMusic: true });
    const combined = compileAlttpAssetSet({ snes, gbaAlttp: gba }, { skipDialogue: true, skipMusic: true });

    expect(baseOnly.base).toEqual(compileResources(snes, { skipDialogue: true, skipMusic: true }));
    expect(baseOnly.gbaSupplement).toBeUndefined();
    expect(combined.base).toEqual(baseOnly.base);
    expect(combined.gbaSupplement).toEqual(compileGbaAlttpSupplement(gba));
  });
});
