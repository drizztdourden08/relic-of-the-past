/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { ShadowEditorPanel, ShadowEditorTools } from '@app/views/ShadowEditorPanel';

const meta: WidgetMeta = {
  label: 'Shadow Editor',
  icon: 'sun',
  kit: 'shadow-editor',
  chrome: 'compact',
  order: 1,
  defaultSide: 'right',
  defaultDockedSize: 280,
  defaultFloatingSize: { width: 300, height: 520 },
  padding: 'none',
  fill: true,
  tools: ShadowEditorTools,
};

const ShadowEditorWidget = () => <ShadowEditorPanel />;

export default ShadowEditorWidget;
export { meta };
