/* @layer shared-game @kind logic */
import { OVERLAY_OF_MARK, SIDE_HOSTS, SIDE_TONES } from '../latin-letters.constants';
import { LATIN_MARKS } from '../latin-marks.constants';
import type { MarkStep } from './compose.type';
import { markIdFor } from './mark-id-for';
import { pairArt } from './pair-art';

const markSteps = (root: string, marks: readonly string[]): MarkStep[] | undefined => {
  const ids = marks.map((mark) => markIdFor(root, mark));
  const steps: MarkStep[] = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i] ?? '';
    const overlay = OVERLAY_OF_MARK.get(id);
    if (overlay !== undefined) {
      steps.push({ kind: 'overlay', overlay });
      continue;
    }
    const art = LATIN_MARKS[id];
    if (art === undefined) return undefined;
    const next = ids[i + 1] ?? '';
    const tone = LATIN_MARKS[next];
    if (SIDE_HOSTS.has(id) && SIDE_TONES.has(next) && tone !== undefined) {
      steps.push({ kind: 'art', art: pairArt(art, tone) });
      i++;
      continue;
    }
    steps.push({ kind: 'art', art });
  }
  return steps;
};

export { markSteps };
