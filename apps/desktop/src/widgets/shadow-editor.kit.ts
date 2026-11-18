/* @layer renderer-widgets @kind config */
import { defineLayoutPreset } from '@drizztdourden08/brock-react';
import type { WidgetKitMeta } from '@drizztdourden08/brock-react';
import { msg } from '@drizztdourden08/brock-core/i18n';

const kit: WidgetKitMeta = {
  label: msg('widgets:shadow.editor.kit.label'),
  icon: 'sun',
  order: 1,
  devOnly: true,
  requires: { context: 'game', reason: msg('widgets:shadow.editor.kit.requires') },
  layout: defineLayoutPreset({
    rows: [[['shadow-elements'], 'main', ['shadow-editor']]],
    widths: [[0.22, 0.5, 0.28]],
  }),
};

export default kit;
