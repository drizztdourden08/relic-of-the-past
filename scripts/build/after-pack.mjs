/* @layer tooling-scripts @kind logic */
import { join } from 'node:path';

const stampVersionInfo = async ({ appOutDir, packager }) => {
  const { productName, productFilename, version } = packager.appInfo;
  const exe = `${productFilename}.exe`;
  const { rcedit } = await import('rcedit');
  await rcedit(join(appOutDir, exe), {
    'file-version': version,
    'product-version': version,
    'version-string': {
      FileDescription: productName,
      ProductName: productName,
      InternalName: productName,
      OriginalFilename: exe,
      CompanyName: productName,
    },
  });
  console.log(`  - version info stamped: ${exe}`);
};

const afterPack = async (context) => {
  if (context.electronPlatformName !== 'win32') return;
  await stampVersionInfo(context);
};

export { afterPack };
