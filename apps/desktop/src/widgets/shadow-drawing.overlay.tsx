/* @layer renderer-widgets @kind component */
import type { KitOverlayMeta } from '@drizztdourden08/brock-react';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { ShadowEditorOverlay } from '@app/views/ShadowEditorOverlay';

const meta: KitOverlayMeta = { kit: 'shadow-editor', label: msg('widgets:shadow.drawing.label') };

const ShadowDrawingOverlay = () => <ShadowEditorOverlay />;

export default ShadowDrawingOverlay;
export { meta };
