/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ControlsTabDef } from '@drizztdourden08/brock-input/renderer';
import { TouchOptionsTab } from './TouchOptionsTab';
import type { TouchOptionsTabProps } from './touch-options-tab.type';

const touchTab = (props: TouchOptionsTabProps, t: I18n['t']): ControlsTabDef => ({
  id: 'touch',
  label: t('profiles:controls.tabs.touch'),
  kind: 'custom',
  render: () => createElement(TouchOptionsTab, props),
});

export { touchTab };
