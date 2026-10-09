/* @layer shared-hud @kind logic */
import { editDistance } from './edit-distance';
import { hudVariableNamesFor } from './hud-variable-names-for';

const suggestVariableName = (name: string, insideRepeat: boolean): string | undefined => {
  const candidates = hudVariableNamesFor({ insideRepeat });
  let best: string | undefined;
  let bestDistance = Infinity;
  candidates.forEach((candidate) => {
    const distance = editDistance(name, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  });
  const threshold = Math.max(2, Math.floor(name.length / 3));
  return best !== undefined && bestDistance <= threshold ? best : undefined;
};

export { suggestVariableName };
