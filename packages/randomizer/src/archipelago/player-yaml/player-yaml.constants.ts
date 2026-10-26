/* @layer shared-game @kind constants */
/** The balancing Archipelago applies when a player file does not ask for another. */
const DEFAULT_PROGRESSION_BALANCING = 50;

/**
 * Catalog rows whose names Archipelago's generator reads as its own on every world, so the
 * file leaves them out; the world package declares neither.
 */
const GENERATOR_OWNED_KEYS: readonly string[] = ['plando_connections', 'start_inventory_from_pool'];

const DEATH_LINK_KEY = 'death_link';

export { DEATH_LINK_KEY, DEFAULT_PROGRESSION_BALANCING, GENERATOR_OWNED_KEYS };
