/* @layer shared-game @kind logic */
import type { FileTarget, ScreenHome } from './record-file-targets.type';
import { AREA_FOLDERS, PLACELESS } from './layout.constants';
import { dungeonFloorFile } from './dungeon-floor-file';
import { dungeonForScreen } from './dungeon-for-screen';

const screenBucket = (screen: ScreenHome): FileTarget => {
  if (screen.kind === 'dungeon') {
    const dungeon = dungeonForScreen(screen);
    if (!dungeon) return { relativePath: null, unresolved: 'no dungeon record covers this palace index' };
    return dungeonFloorFile(dungeon, screen.position?.floor);
  }
  const folder = AREA_FOLDERS[screen.areaId];
  if (!folder || screen.interiorKind === 'special') return { relativePath: PLACELESS };
  return { relativePath: `${screen.kind === 'overworld' ? 'overworld' : 'interiors'}/${folder}` };
};

export { screenBucket };
