/* @layer tests @kind helper */
import { validateLayout } from '@rotp/hud';
import type { HudLayout, HudNode } from '@rotp/hud';

const documentWith = (node: HudNode): HudLayout => ({
  id: 'doc', name: 'doc', builtIn: false,
  screen: {
    kind: 'container',
    id: 'screen',
    layout: 'grid',
    columns: ['auto'],
    children: [{ kind: 'container', id: 'root', direction: 'row', children: [node] }],
  },
});

const roundTrips = (node: HudNode): string => {
  const doc = documentWith(node);
  const reloaded = JSON.parse(JSON.stringify(doc)) as HudLayout;
  const errors = validateLayout(doc).errors;
  if (errors.length > 0) return errors.join('; ');
  return JSON.stringify(reloaded) === JSON.stringify(doc) ? 'round-trips' : 'changed on reload';
};

export { roundTrips };
