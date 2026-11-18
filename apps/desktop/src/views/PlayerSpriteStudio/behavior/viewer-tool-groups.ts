/* @layer renderer-components @kind logic */
import { createElement, Fragment } from 'react';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import { PlaybackControls, ViewSwitch, WearingBar, ZoomControl } from '@rotp/design/packs';
import type { ViewerToolGroupsProps } from '../PlayerSpriteStudio.type';

const viewerToolGroups = (props: ViewerToolGroupsProps): ToolGroup[] => {
  const { wearing, viewer, t } = props;

  return [
    { id: 'view', label: t('views-player-sprite-studio:toolbar.view'), content: createElement(ViewSwitch, { view: viewer.view, onView: viewer.setView }) },
    {
      id: 'playback',
      label: t('views-player-sprite-studio:toolbar.playback'),
      content: createElement(
        Fragment,
        null,
        createElement(PlaybackControls, { clock: viewer.clock }),
        createElement(ZoomControl, { scale: viewer.scale, onScale: viewer.setScale }),
      ),
    },
    {
      id: 'wearing',
      label: t('views-player-sprite-studio:toolbar.wearing'),
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
