/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { ShadowEditorPanel, ShadowEditorTools } from '@app/views/ShadowEditorPanel';

const meta: WidgetMeta = {
  label: msg('widgets:shadow.editor.label'),
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
