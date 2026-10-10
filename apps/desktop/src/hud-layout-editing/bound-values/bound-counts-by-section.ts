/* @layer renderer-components @kind logic */
import { collectBoundValues } from './collect-bound-values';
import { sectionOfPath } from './section-of-path';
import type { HudNode } from '@rotp/hud';
import type { SectionKey } from './bound-values.type';

const boundCountsBySection = (node: HudNode): Partial<Record<SectionKey, number>> => {
  const counts: Partial<Record<SectionKey, number>> = {};
  collectBoundValues(node).forEach(({ path }) => {
    const section = sectionOfPath(path);
    if (!section) return;
    counts[section] = (counts[section] ?? 0) + 1;
  });
  return counts;
};

export { boundCountsBySection };
