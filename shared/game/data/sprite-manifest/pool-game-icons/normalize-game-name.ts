/* @layer shared-game @kind logic */
const normalizeGameName = (game: string): string => game.toLowerCase().replace(/[^a-z0-9]/g, '');

export { normalizeGameName };
