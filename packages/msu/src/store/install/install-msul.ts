/* @layer shared-store @kind logic */
import { installMsul, settleMsulName, uninstallMsul } from '@drizztdourden08/brock-msu/packs';
import type { PackInstaller } from '@rotp/hub-contracts';
import { alttpMsuConfig } from '../../alttp-msu-config';

const msulInstaller: PackInstaller = {
  container: 'msul',
  install: (bytes, files, onProgress) => installMsul(alttpMsuConfig, bytes, files, onProgress),
  uninstall: (installedName, files) => uninstallMsul(alttpMsuConfig, installedName, files),
  settleName: (installedName, ownName, files) => settleMsulName(alttpMsuConfig, installedName, ownName, files),
};

export { msulInstaller };
