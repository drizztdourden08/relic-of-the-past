/* @layer electron-main @kind logic */
import { packDir } from '@rotp/msu';
import { refuseInstalled } from '../../storage/installed-guard';
import { safeName } from './safe-name';

const refuseInstalledPack = (pack: string): Promise<void> => refuseInstalled(packDir(safeName(pack)));

export { refuseInstalledPack };
