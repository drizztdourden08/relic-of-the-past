/**
 * Verification test: item sprite extraction (TS vs Python output).
 *
 * Extracts all item sprites using the TS pipeline and compares them
 * pixel-by-pixel against the Python-generated PNGs already in
 * apps/desktop/public/sprites/items/.
 *
 * Run: npx vitest run tests/asset-extraction/item-sprites.test.ts
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { PNG } from 'pngjs';
import { loadRom } from '../../shared/asset-extraction/rom';
import { loadHudPalette, loadHudSheets, extractHudStandard, extractHudSpecial } from '../../shared/asset-extraction/item-sprites/hud-decoder';
import { loadSpritePalettes, loadReceiptSheets, extractReceipt, extractReceiptRecolor } from '../../shared/asset-extraction/item-sprites/receipt-decoder';
import { loadDropSheets, extractDropStandard, extractDropNumbered, extractDropRupee, extractDropBigkey, extractDropShieldFighters, extractDropShieldFire, extractFollowerBomb } from '../../shared/asset-extraction/item-sprites/drop-decoder';
import type { RomData } from '../../shared/asset-extraction/rom';
import type { SpritePalettes, ReceiptSheets } from '../../shared/asset-extraction/item-sprites/receipt-decoder';
import type { DropSheets } from '../../shared/asset-extraction/item-sprites/drop-decoder';
import type { RGBA } from '../../shared/asset-extraction/graphics/palette';
import { ImageBuffer } from '../../shared/asset-extraction/graphics/png-writer';

const ROM_PATH = process.env.ALTTP_ROM_PATH
  || join(__dirname, '..', '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');

const PYTHON_SPRITES_DIR = join(__dirname, '..', '..', 'apps', 'desktop', 'public', 'sprites', 'items');
const DEFS_PATH = join(__dirname, '..', '..', 'shared', 'data', 'sprite-definitions.json');

const romAvailable = existsSync(ROM_PATH);
const pythonSpritesExist = existsSync(PYTHON_SPRITES_DIR) &&
  readdirSync(PYTHON_SPRITES_DIR).filter(f => f.endsWith('.png')).length > 0;

interface SpriteDefsJson {
  sprites: Array<{
    file: string;
    label: string;
    category: 'hud' | 'hud-item' | 'receipt' | 'drop';
    extract: Record<string, unknown>;
  }>;
}

function loadPythonPng(name: string): { width: number; height: number; data: Buffer } | null {
  const filePath = join(PYTHON_SPRITES_DIR, `${name}.png`);
  if (!existsSync(filePath)) return null;
  const pngData = readFileSync(filePath);
  const png = PNG.sync.read(pngData);
  return { width: png.width, height: png.height, data: png.data as unknown as Buffer };
}

function compareImages(ts: ImageBuffer, pyPng: { width: number; height: number; data: Buffer }): { match: boolean; diffPixels: number } {
  const tsPng = ts.scale(2); // TS produces 16×16, Python produces 32×32
  if (tsPng.width !== pyPng.width || tsPng.height !== pyPng.height) {
    return { match: false, diffPixels: -1 };
  }
  let diffPixels = 0;
  for (let i = 0; i < tsPng.data.length; i += 4) {
    if (tsPng.data[i] !== pyPng.data[i] ||
        tsPng.data[i + 1] !== pyPng.data[i + 1] ||
        tsPng.data[i + 2] !== pyPng.data[i + 2] ||
        tsPng.data[i + 3] !== pyPng.data[i + 3]) {
      diffPixels++;
    }
  }
  return { match: diffPixels === 0, diffPixels };
}

describe.skipIf(!romAvailable || !pythonSpritesExist)('Item sprite extraction — pixel comparison vs Python', () => {
  let rom: RomData;
  let hudSheets: Buffer[];
  let hudPalette: Map<number, RGBA>;
  let spritePalettes: SpritePalettes;
  let receiptSheets: ReceiptSheets;
  let dropSheets: DropSheets;
  let defs: SpriteDefsJson;

  beforeAll(() => {
    rom = loadRom(ROM_PATH);
    hudSheets = loadHudSheets(rom);
    hudPalette = loadHudPalette(rom);
    spritePalettes = loadSpritePalettes(rom);
    receiptSheets = loadReceiptSheets(rom);
    dropSheets = loadDropSheets(rom);
    defs = JSON.parse(readFileSync(DEFS_PATH, 'utf-8'));
  });

  it('extracts at least one sprite without error', () => {
    const first = defs.sprites[0];
    const ext = first.extract as { method: string; tiles: number[] };
    const result = extractHudStandard(ext.tiles, hudSheets, hudPalette);
    expect(result).toBeDefined();
    expect(result.width).toBe(16);
    expect(result.height).toBe(16);
  });

  it('matches Python output for all HUD sprites', () => {
    const hudSprites = defs.sprites.filter(s => s.category === 'hud' || s.category === 'hud-item');
    const results: string[] = [];

    for (const sprite of hudSprites) {
      const ext = sprite.extract as { method: string; tiles: number[]; layout?: string };
      let tsImg: ImageBuffer;
      if (ext.method === 'hud-tiles') {
        tsImg = extractHudStandard(ext.tiles, hudSheets, hudPalette);
      } else if (ext.method === 'hud-special') {
        tsImg = extractHudSpecial(ext.tiles, ext.layout!, hudSheets, hudPalette);
      } else {
        continue;
      }

      const pyPng = loadPythonPng(sprite.file);
      if (!pyPng) {
        results.push(`${sprite.file}: Python PNG not found`);
        continue;
      }

      const { match, diffPixels } = compareImages(tsImg, pyPng);
      if (!match) {
        results.push(`${sprite.file}: ${diffPixels} pixels differ`);
      }
    }

    if (results.length > 0) {
      console.log('HUD mismatches:', results);
    }
    expect(results.length).toBe(0);
  });

  it('matches Python output for all receipt sprites', () => {
    const receiptSprites = defs.sprites.filter(s =>
      s.extract.method === 'receipt' || s.extract.method === 'receipt-recolor'
    );
    const results: string[] = [];

    for (const sprite of receiptSprites) {
      const ext = sprite.extract as { method: string; receiptId: number; palette?: number };
      let tsImg: ImageBuffer | null;
      if (ext.method === 'receipt') {
        tsImg = extractReceipt(ext.receiptId, rom, receiptSheets, spritePalettes);
      } else {
        tsImg = extractReceiptRecolor(ext.receiptId, ext.palette!, rom, receiptSheets, spritePalettes);
      }
      if (!tsImg) {
        results.push(`${sprite.file}: extraction returned null`);
        continue;
      }

      const pyPng = loadPythonPng(sprite.file);
      if (!pyPng) {
        results.push(`${sprite.file}: Python PNG not found`);
        continue;
      }

      const { match, diffPixels } = compareImages(tsImg, pyPng);
      if (!match) {
        results.push(`${sprite.file}: ${diffPixels} pixels differ`);
      }
    }

    if (results.length > 0) {
      console.log('Receipt mismatches:', results);
    }
    expect(results.length).toBe(0);
  });

  it('matches Python output for all drop sprites', () => {
    const dropSprites = defs.sprites.filter(s =>
      s.category === 'drop' && !['receipt', 'receipt-recolor'].includes(s.extract.method as string)
    );
    const results: string[] = [];

    for (const sprite of dropSprites) {
      const ext = sprite.extract as Record<string, unknown>;
      let tsImg: ImageBuffer | null = null;

      try {
        switch (ext.method) {
          case 'drop-standard':
            tsImg = extractDropStandard(ext.spriteType as number, ext.palette as number, spritePalettes, dropSheets);
            break;
          case 'drop-numbered':
            tsImg = extractDropNumbered(ext.spriteType as number, ext.palette as number, ext.group as number, spritePalettes, dropSheets);
            break;
          case 'drop-rupee':
            tsImg = extractDropRupee(ext.palette as number, spritePalettes, dropSheets);
            break;
          case 'drop-bigkey':
            tsImg = extractDropBigkey(ext.palette as number, spritePalettes, receiptSheets);
            break;
          case 'drop-shield-fighters':
            tsImg = extractDropShieldFighters(ext.sheet as number, ext.tiles as number[], ext.palette as number, spritePalettes, dropSheets);
            break;
          case 'drop-shield-fire':
            tsImg = extractDropShieldFire(ext.sheet as number, ext.tiles as number[], ext.palette as number, spritePalettes, dropSheets);
            break;
          case 'follower-bomb':
            tsImg = extractFollowerBomb(ext.palette as number, rom, spritePalettes);
            break;
        }
      } catch (e) {
        results.push(`${sprite.file}: ${(e as Error).message}`);
        continue;
      }

      if (!tsImg) {
        results.push(`${sprite.file}: extraction returned null`);
        continue;
      }

      const pyPng = loadPythonPng(sprite.file);
      if (!pyPng) {
        results.push(`${sprite.file}: Python PNG not found`);
        continue;
      }

      const { match, diffPixels } = compareImages(tsImg, pyPng);
      if (!match) {
        results.push(`${sprite.file}: ${diffPixels} pixels differ`);
      }
    }

    if (results.length > 0) {
      console.log('Drop mismatches:', results);
    }
    expect(results.length).toBe(0);
  });
});
