/* @layer tests @kind helper */
import { existsSync, readdirSync } from 'fs';
import { basename, extname, join } from 'path';
import { DATA_SOURCES, ROM_DIRS, ROM_EXTENSIONS } from './isolated-app.constants';

const isRom = (file: string): boolean => ROM_EXTENSIONS.includes(extname(file).toLowerCase());

const romsIn = (dir: string): string[] => (existsSync(dir) ? readdirSync(dir).filter(isRom).map((file) => join(dir, file)) : []);

const byUsaFirst = (a: string, b: string): number => Number(/\(USA\)/i.test(b)) - Number(/\(USA\)/i.test(a));

const findRom = (): string | null => {
  const dirs = [...DATA_SOURCES.map((dir) => join(dir, 'roms')), ...ROM_DIRS];
  return dirs.flatMap(romsIn).sort(byUsaFirst)[0] ?? null;
};

const assetBlobName = (romPath: string): string => `${basename(romPath, extname(romPath))}.dat`;

const findAssetBlob = (romPath: string): string | null =>
  DATA_SOURCES.map((dir) => join(dir, 'assets', assetBlobName(romPath))).find(existsSync) ?? null;

export { assetBlobName, findAssetBlob, findRom };
