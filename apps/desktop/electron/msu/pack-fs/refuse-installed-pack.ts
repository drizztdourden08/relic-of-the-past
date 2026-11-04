/* @layer electron-main @kind logic */
import { alttpMsuConfig, packDir } from '@rotp/msu';
import { refuseInstalled } from '../../storage/installed-guard';
import { safeName } from './safe-name';

const refuseInstalledPack = (pack: string): Promise<void> => refuseInstalled(packDir(alttpMsuConfig, safeName(pack)));

export { refuseInstalledPack };
