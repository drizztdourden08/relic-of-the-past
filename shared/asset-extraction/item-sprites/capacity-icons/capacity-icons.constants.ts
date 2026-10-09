/* @layer shared-asset-extraction @kind constants */
const CAPACITY_ICONS_FILE = 'capacity-icons.4bpp';

const EXTRACTION_FORMAT_VERSION = 8;

const CAPACITY_ICON_PALETTE_ROW = 4;

const CAPACITY_ICON_FAMILIES: readonly string[] = [
  'upgrade-explosives', 'upgrade-projectiles', 'upgrade-meter', 'upgrade-wallet',
];

export { CAPACITY_ICON_FAMILIES, CAPACITY_ICON_PALETTE_ROW, CAPACITY_ICONS_FILE, EXTRACTION_FORMAT_VERSION };
