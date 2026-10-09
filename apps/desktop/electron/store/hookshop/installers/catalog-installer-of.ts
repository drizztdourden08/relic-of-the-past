/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import type { CatalogInstaller, InstallInput } from '@drizztdourden08/brock-catalog/main';
import type { PackInstaller } from '@rotp/hub-contracts';
import { storeFiles } from '../../store-files';

const catalogInstallerOf = (pack: PackInstaller): CatalogInstaller => {
  const { settleName } = pack;
  const install = async ({ file, report }: InstallInput) => {
    const bytes = new Uint8Array(await readFile(file));
    return pack.install(bytes, storeFiles, ({ done, total }) => report(done, total));
  };
  return {
    install,
    uninstall: (record) => pack.uninstall(record.installedName, storeFiles),
    settleName: settleName && ((installedName, ownName) => settleName(installedName, ownName, storeFiles)),
  };
};

export { catalogInstallerOf };
