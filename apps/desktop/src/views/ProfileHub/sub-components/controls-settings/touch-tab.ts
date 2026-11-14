/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { ControlsTabDef } from '@drizztdourden08/brock-input/renderer';
import { TouchOptionsTab } from './TouchOptionsTab';
import type { TouchOptionsTabProps } from './touch-options-tab.type';

const touchTab = (props: TouchOptionsTabProps): ControlsTabDef => ({
  id: 'touch',
  label: 'Touch',
  kind: 'custom',
  render: () => createElement(TouchOptionsTab, props),
});

export { touchTab };
