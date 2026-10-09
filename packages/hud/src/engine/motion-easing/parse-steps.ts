/* @layer shared-hud @kind logic */
import { STEPS_RE } from './motion-easing.constants';

const parseSteps = (name: string): number | null => {
  const match = STEPS_RE.exec(name.trim());
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n >= 1 ? n : null;
};

export { parseSteps };
