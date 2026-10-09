/* @layer shared-storage @kind logic */
import JSZip from 'jszip';
import { freeSpriteName, readLinkSprite, spriteStem, writeLinkSprite } from '../link-sprites/link-sprites';
import { isRspManifest, isRspName } from '../link-sprites/parse-rsp';
import { MANIFEST_ENTRY } from '@rotp/hub-contracts';
import type { DuplicateInstalled } from './duplicate.type';

const duplicateSprite: DuplicateInstalled = async (files, installedName, basedOn) => {
  if (!isRspName(installedName)) throw new Error(`Not an installed sprite pack: ${installedName}`);
  const bytes = await readLinkSprite(files, installedName);
  if (!bytes) throw new Error(`The sprite "${installedName}" was not found.`);
  const zip = await JSZip.loadAsync(bytes);
  const manifest: unknown = JSON.parse((await zip.file(MANIFEST_ENTRY)?.async('string')) ?? 'null');
  if (!isRspManifest(manifest)) throw new Error(`The sprite "${installedName}" is not a readable sprite pack.`);

  const meta = { ...manifest.meta, name: `${manifest.meta.name || spriteStem(installedName)} copy`, basedOn };
  zip.file(MANIFEST_ENTRY, JSON.stringify({ ...manifest, meta }, null, 2));
  const name = await freeSpriteName(files, `${spriteStem(installedName)}-copy.rsp`);
  await writeLinkSprite(files, name, await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' }));
  return { name };
};

export { duplicateSprite };
