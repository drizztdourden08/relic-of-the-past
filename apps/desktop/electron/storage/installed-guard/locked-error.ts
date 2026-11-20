/* @layer electron-main @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { InstalledPack } from '@rotp/hub-contracts';
import { mainText } from '../../lib/main-text';

const lockedError = (pack: InstalledPack): Error =>
  new Error(mainText(msg('main:storage.installedLocked', { name: pack.origin.name })));

export { lockedError };
