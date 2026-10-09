/* @layer shared-storage @kind logic */
import { isTargetFormat } from './is-target-format';
import { stemKey } from './stem-key';

const targetsByStem = (names: string[]): Map<string, string> => {
  const out = new Map<string, string>();
  for (const name of names) if (isTargetFormat(name)) out.set(stemKey(name), name);
  return out;
};

export { targetsByStem };
