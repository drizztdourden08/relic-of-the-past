/* @layer tooling-scripts @kind logic */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createSsrServer } from '@rotp/ssr-server';
import { APP_PACKAGE_JSON, ROOT } from './apworld.constants.mjs';
import { parsePlayerFileArgs } from './player-file-args.mjs';

const BARREL = '/packages/randomizer/src/archipelago/index.ts';

const writePlayerFile = async ({ name, out, seed, plain }) => {
  const server = await createSsrServer(ROOT);
  try {
    const { rotpPlayerFileOf, snapshotOfPlainOptions } = await server.ssrLoadModule(BARREL);
    const { version } = JSON.parse(readFileSync(APP_PACKAGE_JSON, 'utf8'));
    const { yaml } = rotpPlayerFileOf({
      slotName: name,
      options: snapshotOfPlainOptions(plain),
      seedText: seed ?? name,
      appVersion: version,
    });
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, yaml);
    return out;
  } finally {
    await server.close();
  }
};

try {
  console.log(await writePlayerFile(await parsePlayerFileArgs(process.argv.slice(2))));
} catch (error) {
  console.error(`write-player-file: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
