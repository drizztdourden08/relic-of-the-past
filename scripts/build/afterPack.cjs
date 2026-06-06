/* @layer tooling-scripts @kind logic */
const { execFileSync } = require('child_process');
const path = require('path');

/** @param {import('electron-builder').AfterPackContext} context */
exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return;

  const exePath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`);
  const icoPath = path.resolve(__dirname, '../../apps/desktop/public/logos/icon.ico');

  const { rcedit } = require('rcedit');
  await rcedit(exePath, { icon: icoPath });
  console.log(`  • icon stamped: ${exePath}`);
};
