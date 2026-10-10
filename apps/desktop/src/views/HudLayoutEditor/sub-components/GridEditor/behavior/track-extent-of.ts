/* @layer renderer-components @kind logic */
import { tracksOf } from './tracks-of';
import type { Extent, HudGridContainer } from '@rotp/hud';
import type { TrackAxis } from '../GridEditor.type';

const trackExtentOf = (
  container: HudGridContainer, axis: TrackAxis, index: number,
): Extent | undefined => tracksOf(container, axis)[index];

export { trackExtentOf };
