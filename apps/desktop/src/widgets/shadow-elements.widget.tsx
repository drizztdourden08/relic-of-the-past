/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { ShadowElementList } from '@app/views/ShadowElementList';

const meta: WidgetMeta = {
  label: msg('widgets:shadow.elements.label'),
  icon: 'layers',
  kit: 'shadow-editor',
  chrome: 'compact',
  order: 2,
  defaultSide: 'left',
  defaultDockedSize: 200,
  defaultFloatingSize: { width: 220, height: 400 },
};

const ShadowElementsWidget = () => <ShadowElementList />;

export default ShadowElementsWidget;
export { meta };
