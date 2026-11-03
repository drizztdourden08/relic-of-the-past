/* @layer scripts @kind tooling */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const writeJsonArtifact = (outPath, result) => {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
};

export { writeJsonArtifact };
