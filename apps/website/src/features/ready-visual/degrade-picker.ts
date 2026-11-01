/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradePicker: Degrader<'picker'> = (visual) => {
  const [first, ...rest] = visual.options.filter((option) => isReady(option.before) && isReady(option.after));
  if (first) return { ...visual, options: [first, ...rest] };
  const shot = visual.options.map((option) => option.after).find(isReady);
  return shot ? { kind: 'single', shot } : null;
};

export { degradePicker };
