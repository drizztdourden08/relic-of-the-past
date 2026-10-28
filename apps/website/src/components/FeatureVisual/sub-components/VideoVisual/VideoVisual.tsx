/* @layer website-site @kind component */
import { aspectOf } from '../../behavior/aspect-of';
import { ClipPlayer } from '../ClipPlayer';
import { Expandable } from '../Expandable';
import { ShotFrame } from '../ShotFrame';
import { SoundVideo } from '../SoundVideo';
import type { VisualProps } from '../../FeatureVisual.type';

const VideoVisual = ({ visual, caption }: VisualProps<'video'>) =>
  visual.sound ? (
    <SoundVideo clip={visual.video} caption={caption} />
  ) : (
    <ShotFrame caption={caption}>
      <Expandable aspect={aspectOf(visual.video.poster)} label={caption} expanded={<ClipPlayer clip={visual.video} />}>
        <ClipPlayer clip={visual.video} />
      </Expandable>
    </ShotFrame>
  );

export { VideoVisual };
