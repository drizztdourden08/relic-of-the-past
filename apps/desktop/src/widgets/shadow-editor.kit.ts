/* @layer renderer-widgets @kind config */
import { defineLayoutPreset } from '@drizztdourden08/brock-react';
import type { WidgetKitMeta } from '@drizztdourden08/brock-react';

const kit: WidgetKitMeta = {
  label: 'Shadow Editor',
  icon: 'sun',
  order: 1,
  devOnly: true,
  requires: { context: 'game', reason: 'Start a game to use the Shadow Editor.' },
  layout: defineLayoutPreset({
    rows: [[['shadow-elements'], 'main', ['shadow-editor']]],
    widths: [[0.22, 0.5, 0.28]],
  }),
};

export default kit;
