/* @layer electron-main @kind logic */
import { recommendationFile } from '@rotp/navigation';
import type { EntityKind } from '@rotp/game-data';
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';

const recommendationFilePath = (kind: EntityKind): string =>
  getUserDataPath(...recommendationFile(kind).split('/'));

export { recommendationFilePath };
