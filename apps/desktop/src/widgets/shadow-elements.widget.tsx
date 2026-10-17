/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { ShadowElementList } from '@app/views/ShadowElementList';

const meta: WidgetMeta = {
  label: 'Shadow Elements',
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
