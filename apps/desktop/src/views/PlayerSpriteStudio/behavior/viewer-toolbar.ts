/* @layer renderer-hooks @kind logic */
import { createElement } from 'react';
import { PlaybackControls, ViewSwitch, WearingBar, ZoomControl } from '@rotp/design/packs';
import type { StudioToolGroup } from '../../../compounds/StudioFrame';
import type { ViewerToolbarParams } from '../PlayerSpriteStudio.type';

const viewerToolbar = (params: ViewerToolbarParams): StudioToolGroup[] => {
  const { open, wearing, viewer } = params;
  if (!open) return [];

  return [
    {
      id: 'character',
      label: 'Character',
      content: createElement(WearingBar, {
        flat: true,
        outfit: wearing.outfit,
        gloves: wearing.gloves,
        onOutfit: wearing.setOutfit,
        onGloves: wearing.setGloves,
      }),
    },
    { id: 'view', label: 'View', content: createElement(ViewSwitch, { view: viewer.view, onView: viewer.setView }) },
    { id: 'playback', label: 'Playback', content: createElement(PlaybackControls, { clock: viewer.clock }) },
    { id: 'zoom', label: 'Zoom', content: createElement(ZoomControl, { scale: viewer.scale, onScale: viewer.setScale }) },
  ];
};

export { viewerToolbar };
