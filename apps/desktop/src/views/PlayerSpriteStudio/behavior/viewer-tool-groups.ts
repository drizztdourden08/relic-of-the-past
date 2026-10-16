/* @layer renderer-components @kind logic */
import { createElement, Fragment } from 'react';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import { PlaybackControls, ViewSwitch, WearingBar, ZoomControl } from '@rotp/design/packs';
import type { ViewerToolGroupsProps } from '../PlayerSpriteStudio.type';

const viewerToolGroups = (props: ViewerToolGroupsProps): ToolGroup[] => {
  const { wearing, viewer } = props;

  return [
    { id: 'view', label: 'View', content: createElement(ViewSwitch, { view: viewer.view, onView: viewer.setView }) },
    {
      id: 'playback',
      label: 'Playback',
      content: createElement(
        Fragment,
        null,
        createElement(PlaybackControls, { clock: viewer.clock }),
        createElement(ZoomControl, { scale: viewer.scale, onScale: viewer.setScale }),
      ),
    },
    {
      id: 'wearing',
      label: 'Wearing',
      content: createElement(WearingBar, {
        flat: true,
        outfit: wearing.outfit,
        gloves: wearing.gloves,
        onOutfit: wearing.setOutfit,
        onGloves: wearing.setGloves,
      }),
    },
  ];
};

export { viewerToolGroups };
