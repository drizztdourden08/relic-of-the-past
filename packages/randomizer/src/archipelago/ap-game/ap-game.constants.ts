/* @layer shared-game @kind constants */
const AP_GAME = 'Relic of the Past';

const AP_ID_BASE = 0x52500000;

const AP_ITEM_ID_OFFSET = 0x10000;

const AP_WORLD_VERSION = '0.1.0';

/** The folder the world package lives in, and so the name Archipelago loads it by. */
const WORLD_MODULE_NAME = 'relic_of_the_past';

/**
 * The Archipelago versions this world is known to run on, oldest first. A host and its clients
 * run the exact same version, so the app offers only these. 0.6.4 is the oldest the package
 * declares; 0.6.6 is the one the generator oracle ran against. Add a version here only after
 * the oracle (apworld-oracle.keep.test.ts) has generated against it.
 */
const SUPPORTED_AP_VERSIONS: readonly string[] = ['0.6.4', '0.6.5', '0.6.6'];

/** The version used until a profile or setting picks another: the newest supported. */
const DEFAULT_AP_VERSION = '0.6.6';

export { AP_GAME, AP_ID_BASE, AP_ITEM_ID_OFFSET, AP_WORLD_VERSION, DEFAULT_AP_VERSION, SUPPORTED_AP_VERSIONS, WORLD_MODULE_NAME };
