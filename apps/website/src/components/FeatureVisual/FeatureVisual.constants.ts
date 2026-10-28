/* @layer website-site @kind data */
import { CloudVisual } from './sub-components/CloudVisual';
import { CollageVisual } from './sub-components/CollageVisual';
import { CompareVisual } from './sub-components/CompareVisual';
import { IconsVisual } from './sub-components/IconsVisual';
import { LensVisual } from './sub-components/LensVisual';
import { PickerVisual } from './sub-components/PickerVisual';
import { PinsVisual } from './sub-components/PinsVisual';
import { RatiosVisual } from './sub-components/RatiosVisual';
import { SingleVisual } from './sub-components/SingleVisual';
import { TitleVisual } from './sub-components/TitleVisual';
import { VideoVisual } from './sub-components/VideoVisual';
import type { VisualRenderers } from './FeatureVisual.type';

const VISUAL_RENDERERS: VisualRenderers = {
  single: SingleVisual,
  compare: CompareVisual,
  picker: PickerVisual,
  ratios: RatiosVisual,
  lens: LensVisual,
  collage: CollageVisual,
  pins: PinsVisual,
  title: TitleVisual,
  icons: IconsVisual,
  video: VideoVisual,
  cloud: CloudVisual,
};

export { VISUAL_RENDERERS };
