/* @layer renderer-widgets @kind config */
import { defineLayoutPreset } from '@drizztdourden08/brock-react';
import type { WidgetKitMeta } from '@drizztdourden08/brock-react';

const kit: WidgetKitMeta = {
  label: 'Developer tools',
  icon: 'wrench',
  order: 1,
  devOnly: true,
  requires: { context: 'game', reason: 'Start a game to use the developer tools.' },
  layout: defineLayoutPreset({
    rows: [[['shadow-elements', 'dataset', 'navigation'], 'main', ['shadow-editor', 'debug', 'music', 'simulator']]],
    widths: [[0.22, 0.5, 0.28]],
  }),
};

export default kit;
