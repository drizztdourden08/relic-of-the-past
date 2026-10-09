/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { EXTRACTION_STAMP_FILE, parseExtractionStamp } from '@shared/asset-extraction/item-sprites/extraction-stamp';
import { spriteDir } from './sprite-dir';

const readStampVersion = async (files: FileStore, romFile: string): Promise<string | null> =>
  parseExtractionStamp(await files.readText(`${spriteDir(romFile)}/${EXTRACTION_STAMP_FILE}`));

export { readStampVersion };
