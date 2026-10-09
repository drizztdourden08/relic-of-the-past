/* @layer renderer-components @kind logic */
import type { Extent, HudGridContainer } from '@shared/types/hud';
import type { TrackAxis } from '../../GridEditor.type';

const tracksOf = (container: HudGridContainer, axis: TrackAxis): readonly Extent[] =>
  (axis === 'columns' ? container.columns : (container.rows ?? []));

export { tracksOf };
