/* @layer electron-main @kind logic */
/**
 * Duplicating an installed item into one the player can edit. The install record names the
 * item and its licence; a licence that does not allow copies is refused with its reason.
 * Otherwise the kind's duplicate writes the copy through the store's in-process file store,
 * crediting the original in `basedOn`. A language copy is baked into the game assets after,
 * the way an install does it.
 */
import type { StoreDuplicateResult } from '@shared/ipc';
import type { BasedOn } from '@shared/store/based-on';
import type { InstalledPack } from '@shared/store/installed-types';
import { copyRefusal } from '@shared/store/licenses';
import { selectDuplicate } from '@shared/storage/duplicate/select-duplicate';
import { recompileAllAssets } from '../assets/compile-rom-assets';
import { logToRenderer } from '../lib/renderer-log';
import { assertItemId } from './catalog';
import { isInstalling } from './install-jobs';
import { installedRegistry, storeFiles } from './store-files';

const basedOnOf = (pack: InstalledPack): BasedOn => {
  const { itemId, semver, origin } = pack;
  return { itemId, name: origin.name, author: origin.author.displayName, license: origin.license, semver };
};

const duplicateInstalled = async (itemId: string): Promise<StoreDuplicateResult> => {
  const pack = await installedRegistry.get(assertItemId(itemId));
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
