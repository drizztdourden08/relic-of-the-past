/* @layer renderer-hooks @kind logic */
import type { PlayerSheet } from '@rotp/game-data';

const titleOf = (sheet: PlayerSheet | null): string => {
  if (!sheet) return 'No sprite open';
  return sheet.meta.name || 'Untitled sprite';
};

export { titleOf };
