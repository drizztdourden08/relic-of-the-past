/* @layer electron-main @kind logic */
import { recommendationFile } from '@rotp/navigation/recommendations';
import type { EntityKind } from '@rotp/game-data';
import { getUserDataPath } from '@drizztdourden08/brock-electron/node';

const recommendationFilePath = (kind: EntityKind): string =>
  getUserDataPath(...recommendationFile(kind).split('/'));

export { recommendationFilePath };
