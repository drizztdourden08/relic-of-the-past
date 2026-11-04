/* @layer tests @kind helper */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect } from 'vitest';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const WRITE = process.env.GOLDEN_TRACES_WRITE === '1';

const checkTrace = (name: string, trace: unknown): void => {
  const text = JSON.stringify(trace, null, 2);
  const file = join(FIXTURES, `${name}.trace.json`);
  if (WRITE) {
    mkdirSync(FIXTURES, { recursive: true });
    writeFileSync(file, text);
    return;
  }
  expect(existsSync(file), `missing fixture ${name}.trace.json: capture it with GOLDEN_TRACES_WRITE=1`).toBe(true);
  expect(text === readFileSync(file, 'utf8'), `${name} trace differs from the recorded fixture`).toBe(true);
};

export { checkTrace };
