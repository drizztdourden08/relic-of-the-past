/* @layer electron-main @kind logic */
/**
 * The main process's half of "are this ROM's sprites complete?".
 *
 * The renderer answers the same question over its FileStore
 * (`shared/storage/sprites.ts`), and that is the path the app actually takes
 * today. This one backs the `sprites:check` / `sprites:extract` IPC, which is
 * still part of the contract and must not disagree with it. Both read the same
 * receipt file, keyed by the same manifest digest, so whichever half extracted
 * a folder, the other half recognises it.
 *
 * Why a receipt instead of a bare filename comparison: a definition the ROM
 * cannot satisfy produces no file, and a bare comparison would then find that
 * file missing forever and re-extract on every single launch. A completed run
 * records the manifest it ran against; a receipt for the current manifest is
 * taken at its word. Change the manifest and the digest changes with it, so a
 * grown manifest still forces the folder to be compared name by name. That is
 * exactly the one-time re-extract an older profile needs.
 */
import { readdir } from 'fs/promises';
import { join } from 'path';
import { readJson, writeJson } from '../lib/json-store';
import { expectedSpriteFiles, spriteManifestDigest } from '@shared/storage/sprite-manifest-digest';

/** Same name the renderer half writes. See the header. */
const RECEIPT_FILE = 'extraction.json';

interface ExtractionReceipt {
  manifest: string;
  count: number;
}

interface ExtractionStatus {
  extracted: boolean;
  count: number;
}

const receiptPath = (outDir: string): string => join(outDir, RECEIPT_FILE);

const pngsIn = async (outDir: string): Promise<Set<string>> => {
  try {
    return new Set((await readdir(outDir)).filter(f => f.endsWith('.png')));
  } catch {
    return new Set<string>();
  }
};

/** Record that this folder was extracted against the manifest as it stands. */
const writeExtractionReceipt = async (outDir: string): Promise<void> => {
  const receipt: ExtractionReceipt = { manifest: spriteManifestDigest(), count: (await pngsIn(outDir)).size };
  await writeJson(receiptPath(outDir), receipt);
};

const checkExtraction = async (outDir: string): Promise<ExtractionStatus> => {
  // An empty (or absent) folder is never complete, receipt or no receipt.
  const present = await pngsIn(outDir);
  if (present.size === 0) return { extracted: false, count: 0 };

  const receipt = await readJson<ExtractionReceipt | null>(receiptPath(outDir), null);
  if (receipt && receipt.manifest === spriteManifestDigest()) return { extracted: true, count: present.size };

  return { extracted: expectedSpriteFiles().every(file => present.has(file)), count: present.size };
};

export { checkExtraction, writeExtractionReceipt };
export type { ExtractionStatus };
