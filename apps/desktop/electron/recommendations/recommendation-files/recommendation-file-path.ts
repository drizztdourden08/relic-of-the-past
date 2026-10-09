/* @layer electron-main @kind logic */
import { recommendationFile } from '@shared/game/recommendations';
import type { EntityKind } from '@shared/game/data';
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';

const recommendationFilePath = (kind: EntityKind): string =>
  getUserDataPath(...recommendationFile(kind).split('/'));

export { recommendationFilePath };
