/* @layer renderer-components @kind component */
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import { PlaybackControls, ViewSwitch, WearingBar, ZoomControl } from '@rotp/design/packs';
import type { ViewerToolGroupsProps } from '../PlayerSpriteStudio.type';

const viewerToolGroups = (props: ViewerToolGroupsProps): ToolGroup[] => {
  const { wearing, viewer } = props;

  return [
    { id: 'view', label: 'View', content: <ViewSwitch view={viewer.view} onView={viewer.setView} /> },
    {
      id: 'playback',
      label: 'Playback',
      content: (
        <>
          <PlaybackControls clock={viewer.clock} />
          <ZoomControl scale={viewer.scale} onScale={viewer.setScale} />
        </>
      ),
    },
    {
      id: 'wearing',
      label: 'Wearing',
      content: (
        <WearingBar
          flat
          outfit={wearing.outfit}
          gloves={wearing.gloves}
          onOutfit={wearing.setOutfit}
          onGloves={wearing.setGloves}
        />
      ),
    },
  ];
};

export { viewerToolGroups };
