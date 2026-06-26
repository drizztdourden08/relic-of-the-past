/* @layer tooling-scripts @kind config */
/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: 'com.relicofthepast.app',
  productName: 'Relic of the Past',
  npmRebuild: false,
  afterPack: './scripts/build/afterPack.cjs',
  publish: [{
    provider: 'github',
    owner: 'drizztdourden08',
    repo: 'relic-of-the-past',
  }],
  directories: {
    buildResources: 'build',
  },
  files: [
    'dist/electron/**/*',
    'dist/preload/**/*',
    'dist/renderer/**/*',
    'package.json',
  ],
  asarUnpack: [
    '**/node_modules/node-hid/**',
    '**/node_modules/usb/**',
  ],
  win: {
    target: ['portable', 'nsis'],
    icon: 'apps/web/public/logos/icon.ico',
    signAndEditExecutable: false,
  },
  portable: {
    artifactName: 'rotp-windows-portable.exe',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    artifactName: 'rotp-windows-setup.exe',
    installerSidebar: 'apps/web/public/logos/installerSidebar.bmp',
    uninstallerSidebar: 'apps/web/public/logos/uninstallerSidebar.bmp',
  },
  mac: {
    target: ['dmg', 'zip'],
    icon: 'apps/web/public/logos/logo-512.png',
    artifactName: 'rotp-macos.${ext}',
    // Ad-hoc signature (no Apple Developer ID). On Apple Silicon this stops
    // Gatekeeper reporting the app as "damaged"; users still right-click → Open
    // once to clear the unidentified-developer prompt.
    identity: '-',
  },
  linux: {
    target: ['AppImage', 'deb'],
    icon: 'apps/web/public/logos/logo-256.png',
    artifactName: 'rotp-linux.${ext}',
    category: 'Game',
    maintainer: 'drizztdourden08@users.noreply.github.com',
  },
  // .deb auto-installs the controller udev rules (AppImage users install manually —
  // see docs/controllers/linux-setup.md).
  deb: {
    afterInstall: 'scripts/build/linux/deb-postinst.sh',
  },
};
