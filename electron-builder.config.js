/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: 'com.relicofthepast.app',
  productName: 'Relic of the Past',
  npmRebuild: false,
  publish: [{
    provider: 'github',
    owner: 'drizztdourden08',
    repo: 'relic-of-the-past',
  }],
  directories: {
    buildResources: 'build',
  },
  files: [
    'dist/**/*',
    'package.json',
  ],
  asarUnpack: [
    '**/node_modules/node-hid/**',
    '**/node_modules/usb/**',
  ],
  win: {
    target: ['portable', 'nsis'],
    icon: 'apps/desktop/public/logos/logo-256.png',
    signAndEditExecutable: false,
  },
  portable: {
    artifactName: 'rotp-portable.exe',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    artifactName: 'rotp-setup.exe',
  },
  mac: {
    target: ['dmg', 'zip'],
    icon: 'apps/desktop/public/logos/logo-512.png',
    artifactName: 'rotp.${ext}',
  },
  linux: {
    target: ['AppImage', 'deb'],
    icon: 'apps/desktop/public/logos/logo-256.png',
    artifactName: 'rotp.${ext}',
    category: 'Game',
    maintainer: 'drizztdourden08@users.noreply.github.com',
  },
};
