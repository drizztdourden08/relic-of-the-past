/* @layer shared-asset-extraction @kind logic */
import type { DecodedLine } from '../../menu-text/menu-text.type';

const changedLines = (patched: readonly DecodedLine[], base: readonly DecodedLine[] | null): Record<string, string> => {
  const before = new Map((base ?? []).map((line) => [line.key, line.text]));
  return Object.fromEntries(
    patched.filter((line) => base === null || before.get(line.key) !== line.text).map((line) => [line.key, line.text]),
  );
};

export { changedLines };
