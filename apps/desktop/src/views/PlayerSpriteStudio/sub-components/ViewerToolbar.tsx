/* @layer renderer-components @kind component */
import { Divider } from '@drizztdourden08/tessera/primitives';
import { PlaybackControls, ViewSwitch, WearingBar, ZoomControl } from '@rotp/design/packs';
import type { ViewerToolbarProps } from '../PlayerSpriteStudio.type';

const ViewerToolbar = (props: ViewerToolbarProps) => {
  const { wearing, viewer } = props;

  return (
    <>
      <ViewSwitch view={viewer.view} onView={viewer.setView} />
      <Divider orientation="vertical" />
      <PlaybackControls clock={viewer.clock} />
      <ZoomControl scale={viewer.scale} onScale={viewer.setScale} />
      <Divider orientation="vertical" />
      <WearingBar
        flat
        outfit={wearing.outfit}
        gloves={wearing.gloves}
        onOutfit={wearing.setOutfit}
        onGloves={wearing.setGloves}
      />
    </>
  );
};

export { ViewerToolbar };
