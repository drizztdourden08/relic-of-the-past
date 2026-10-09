/* @layer tests @kind helper */
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { afterEach, beforeEach } from 'vitest';
import type { WriterWorkspace } from './dataset-record-writers.type';

const arrayFile = (name: string, body: string): string =>
  `/* @layer shared-game @kind data */\nconst ${name} = [\n${body}];\n\nexport { ${name} };\n`;

const record = (fields: string): string => `  {\n${fields}  },\n`;

const setUpWriterWorkspace = (): WriterWorkspace => {
  let root = '';

  const recordPath = (relativePath: string): string => join(root, 'shared', 'game', 'data', 'records', relativePath);

  const seed = async (relativePath: string, contents: string): Promise<void> => {
    const path = recordPath(relativePath);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, contents, 'utf-8');
  };

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'rotp-writers-'));

    await seed('items/randomizer.ts', arrayFile('RANDOMIZER', record(
      "    id: 'item-001',\n    origin: 'vanilla',\n    category: 'junk',\n    name: 'Blue Rupee',\n",
    )));
    await seed('items/junk.ts', arrayFile('JUNK', ''));

    await seed('actors/bosses.ts', arrayFile('BOSSES', record(
      "    id: 'actor-001',\n    gameId: { spriteType: 8 },\n    kind: 'enemy',\n    name: 'Guard',\n",
    )));
    await seed('actors/enemies.ts', arrayFile('ENEMIES', ''));

    await seed('dungeons/light-world/first.ts', arrayFile('FIRST', record(
      "    id: 'dungeon-001',\n    gameId: { palaceIndex: 0 },\n    name: 'First',\n"
      + "    fileStem: 'first',\n    roomScreenIds: [],\n",
    )));

    await seed('checks/dark-world/turtle-rock.ts', arrayFile('TR', ''));

    await seed('areas/light-world.ts', arrayFile('LIGHT_AREAS', record(
      "    id: 'area-001',\n    world: 'light',\n    name: 'Central',\n",
    )));
    await seed('areas/dark-world.ts', arrayFile('DARK_AREAS', ''));
    await seed('locations/light-world.ts', arrayFile('LIGHT_LOCATIONS', record(
      "    id: 'location-001',\n    areaId: 'area-001',\n    name: 'A Village',\n",
    )));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  return {
    root: () => root,
    sourceOf: (relativePath) => readFile(recordPath(relativePath), 'utf-8'),
  };
};

export { setUpWriterWorkspace };
