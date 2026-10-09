/* @layer shared-storage @kind logic */
import { isTargetFormat } from './is-target-format';
import { stemKey } from './stem-key';
import { targetsByStem } from './targets-by-stem';

const supersededMap = (names: string[]): Map<string, string> => {
  const targets = targetsByStem(names);
  const out = new Map<string, string>();
  for (const name of names) {
    if (isTargetFormat(name)) continue;
    const target = targets.get(stemKey(name));
    if (target !== undefined) out.set(name, target);
  }
  return out;
};

export { supersededMap };
