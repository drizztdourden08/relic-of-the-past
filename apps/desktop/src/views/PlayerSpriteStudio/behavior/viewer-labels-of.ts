/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ViewerLabels } from '@rotp/design/packs';

const viewerLabelsOf = (t: I18n['t']): ViewerLabels => ({
  viewState: t('views-player-sprite-studio:viewer.view-state'),
  viewContact: t('views-player-sprite-studio:viewer.view-contact'),
  viewSheet: t('views-player-sprite-studio:viewer.view-sheet'),
  play: t('views-player-sprite-studio:viewer.play'),
  pause: t('views-player-sprite-studio:viewer.pause'),
  step: t('views-player-sprite-studio:viewer.step'),
  fpsAria: t('views-player-sprite-studio:viewer.fps-aria'),
  fps: (fps) => t('views-player-sprite-studio:viewer.fps', { fps }),
  zoomAria: t('views-player-sprite-studio:viewer.zoom-aria'),
  zoom: (zoom) => t('views-player-sprite-studio:viewer.zoom', { zoom }),
});

export { viewerLabelsOf };
