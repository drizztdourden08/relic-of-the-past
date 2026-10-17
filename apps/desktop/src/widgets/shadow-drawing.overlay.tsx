/* @layer renderer-widgets @kind component */
import type { KitOverlayMeta } from '@drizztdourden08/brock-react';
import { ShadowEditorOverlay } from '@app/views/ShadowEditorOverlay';

const meta: KitOverlayMeta = { kit: 'shadow-editor', label: 'Shadow drawing' };

const ShadowDrawingOverlay = () => <ShadowEditorOverlay />;

export default ShadowDrawingOverlay;
export { meta };
