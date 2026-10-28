/* @layer shared-game @kind constants */
const AP_GAME = 'Relic of the Past';

const AP_ID_BASE = 0x52500000;

const AP_ITEM_ID_OFFSET = 0x10000;

const AP_WORLD_VERSION = '0.1.0';

const WORLD_MODULE_NAME = 'relic_of_the_past';

const SUPPORTED_AP_VERSIONS: readonly string[] = ['0.6.6', '0.6.7', '0.6.8'];

const DEFAULT_AP_VERSION = '0.6.8';

export { AP_GAME, AP_ID_BASE, AP_ITEM_ID_OFFSET, AP_WORLD_VERSION, DEFAULT_AP_VERSION, SUPPORTED_AP_VERSIONS, WORLD_MODULE_NAME };
