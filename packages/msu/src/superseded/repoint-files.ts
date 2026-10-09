/* @layer shared-storage @kind logic */
import { isTargetFormat } from './is-target-format';
import { stemKey } from './stem-key';

const repointFiles = (files: string[], targets: Map<string, string>): string[] | null => {
  let changed = false;
  const moved: string[] = [];
  for (const file of files) {
    const target = isTargetFormat(file) ? undefined : targets.get(stemKey(file));
    const next = target ?? file;
    if (next !== file) changed = true;
    if (moved.includes(next)) { changed = true; continue; }
    moved.push(next);
  }
  return changed ? moved : null;
};

export { repointFiles };
