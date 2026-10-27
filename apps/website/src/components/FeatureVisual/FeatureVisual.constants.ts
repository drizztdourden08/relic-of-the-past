/* @layer website-site @kind data */
import { ClipVisual } from './sub-components/ClipVisual';
import { CollageVisual } from './sub-components/CollageVisual';
import { CompareVisual } from './sub-components/CompareVisual';
import { LensVisual } from './sub-components/LensVisual';
import { OverlayVisual } from './sub-components/OverlayVisual';
import { PinsVisual } from './sub-components/PinsVisual';
import { SingleVisual } from './sub-components/SingleVisual';
import type { VisualRenderers } from './FeatureVisual.type';

const VISUAL_RENDERERS: VisualRenderers = {
  single: SingleVisual,
  compare: CompareVisual,
  overlay: OverlayVisual,
  lens: LensVisual,
  collage: CollageVisual,
  pins: PinsVisual,
  clip: ClipVisual,
};

export { VISUAL_RENDERERS };
