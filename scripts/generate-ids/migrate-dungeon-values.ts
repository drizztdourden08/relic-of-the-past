/**
 * @layer tooling-scripts
 * @kind logic
 * Phase 5 transform: re-key DUNGEON_META's locationId/areaId (old slugs) to
 * new ids via the id-manifest. Prints the remapped object for hand-pasting
 * into logic/queries/dungeon-values.ts (small, one-off — not worth a full
 * codegen pipeline for 13 entries).
 */
import * as fs from 'fs';
import * as path from 'path';
import { DUNGEON_META } from '../../shared/game/data/screens/game-values/palace-indices';

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'output/id-manifest.json'), 'utf8'));

const remapped = Object.fromEntries(
  Object.entries(DUNGEON_META).map(([name, meta]) => [
    name,
    { locationId: manifest.locations[meta.locationId], areaId: manifest.areas[meta.areaId], world: meta.world },
  ]),
);
console.log(JSON.stringify(remapped, null, 2));
