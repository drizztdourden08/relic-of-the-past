/* @layer renderer-app @kind logic */
import { findOne } from '@rotp/game-data';
import { screenName } from './record-names';

const screenLabel = (id: string): string => {
  const screen = findOne('screen', (candidate) => candidate.id === id);
  return screen ? `${id} (${screenName(screen)})` : id;
};

export { screenLabel };
