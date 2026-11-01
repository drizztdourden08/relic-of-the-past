/* @layer website-site @kind constants */
import type { Platform } from '../platform';

const PLATFORM_MATCHERS: Record<Platform, RegExp[]> = {
  windows: [/setup.*\.exe$/i, /\.exe$/i, /\.msi$/i],
  mac: [/\.dmg$/i, /(mac|darwin).*\.zip$/i],
  linux: [/\.appimage$/i, /\.deb$/i, /\.rpm$/i, /\.tar\.gz$/i],
  unknown: [],
};

const INTERNAL_ASSETS = [/^rotp-windows-payload\.exe$/i, /^rotp-windows-directory\.zip$/i, /^sdl3-input-/i];

const VARIANT_LABELS: Array<[RegExp, string]> = [
  [/setup|installer/i, 'Installer'],
  [/\.msi$/i, 'MSI'],
  [/\.appimage$/i, 'AppImage'],
  [/\.deb$/i, '.deb package'],
  [/\.rpm$/i, '.rpm package'],
  [/\.dmg$/i, 'DMG'],
  [/\.zip$/i, 'ZIP'],
  [/\.tar\.gz$/i, 'tarball'],
];

const DEFAULT_VARIANT_LABEL = 'Download';

export { DEFAULT_VARIANT_LABEL, INTERNAL_ASSETS, PLATFORM_MATCHERS, VARIANT_LABELS };
