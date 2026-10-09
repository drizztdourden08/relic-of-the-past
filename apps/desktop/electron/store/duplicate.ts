/* @layer electron-main @kind logic */
import { isCatalogItemId } from '@drizztdourden08/brock-catalog/main';
import type { StoreDuplicateResult } from '@shared/ipc';
import type { BasedOn } from '@rotp/game-data';
import type { InstalledPack } from '@rotp/hub-contracts';
import { copyRefusal } from '@rotp/hub-contracts';
import { selectDuplicate } from '@rotp/packs';
import { recompileAllAssets } from '../assets/compile-rom-assets';
import { logToRenderer } from '../lib/renderer-log';
import { installedPacks, isInstalling } from './hookshop';
import { storeFiles } from './store-files';

const basedOnOf = (pack: InstalledPack): BasedOn => {
  const { itemId, semver, origin } = pack;
  return { itemId, name: origin.name, author: origin.author.displayName, license: origin.license, semver };
};

const duplicateInstalled = async (itemId: string): Promise<StoreDuplicateResult> => {
  if (!isCatalogItemId(itemId)) throw new Error('That is not a Hookshop item.');
  const pack = (await installedPacks()).find((one) => one.itemId === itemId);
  if (!pack) throw new Error('That item is not installed.');
  if (isInstalling(itemId)) throw new Error('Wait for the install to finish first.');
  const refusal = copyRefusal(pack.origin.license);
  if (refusal) throw new Error(refusal);

  const { name } = await selectDuplicate(pack.kind)(storeFiles, pack.installedName, basedOnOf(pack));
  if (pack.kind === 'language') await recompileAllAssets();
  logToRenderer('app', 'info', `[Hookshop] Duplicated ${pack.kind} "${pack.installedName}" as "${name}"`);
  return { kind: pack.kind, name };
};

export { duplicateInstalled };
