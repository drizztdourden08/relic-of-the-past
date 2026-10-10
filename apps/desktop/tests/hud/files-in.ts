/* @layer tests @kind helper */
import { readdirSync } from 'fs';
import { join } from 'path';

const filesIn = (dir: string, matches: (name: string) => boolean): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return filesIn(path, matches);
    return matches(entry.name) ? [path] : [];
  });

const cssIn = (dir: string): string[] => filesIn(dir, (name) => name.endsWith('.css'));

export { cssIn, filesIn };
