/* @layer renderer-hud @kind logic */
import type { EnterExitCssInput } from './enter-exit-css.type';
import { transitionDuration } from './transition-duration';
import { transitionSpecOf } from './transition-spec';

const enterExitCss = ({ id, nodes, ghosts, enteringIds, exitingIds }: EnterExitCssInput): string | undefined => {
  const entering = enteringIds.has(id);
  if (!entering && !exitingIds.has(id)) return undefined;
  const placed = nodes.find((p) => p.id === id) ?? ghosts.find((g) => g.placed.id === id)?.placed;
  const spec = transitionSpecOf(placed, entering);
  if (!spec) return undefined;
  const duration = transitionDuration(spec);
  const easing = spec.easing ?? 'ease-out';
  return `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
};

export { enterExitCss };
