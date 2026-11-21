/* @layer renderer-components @kind logic */
import type { I18n, MessageKey } from '@drizztdourden08/brock-core/i18n';
import type { ViewerLabels } from '@rotp/design/packs';
import { STATE_LABELS } from '@rotp/game-data';
import { FACING_KEYS, GLOVE_KEYS } from '../PlayerSpriteStudio.constants';
import { outfitName } from './outfit-name';

const hexOf = (action: number): string => action.toString(16).padStart(2, '0');

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
  stateName: (action) => (STATE_LABELS.some((s) => s.action === action)
    ? t(`views-player-sprite-studio:state.${hexOf(action)}` as MessageKey)
    : t('views-player-sprite-studio:viewer.action-id', { hex: hexOf(action) })),
  groupName: (group) => t(`views-player-sprite-studio:group.${group}` as MessageKey),
  facingName: (facing) => t(`views-player-sprite-studio:facing.${FACING_KEYS[facing]}` as MessageKey),
  allFacings: t('views-player-sprite-studio:viewer.all-facings'),
  noFacingVariation: t('views-player-sprite-studio:viewer.no-facing-variation'),
  frameCount: (count) => t('views-player-sprite-studio:viewer.frame-count', { count }),
  actionId: (hex) => t('views-player-sprite-studio:viewer.action-id', { hex }),
  filterStates: (count) => t('views-player-sprite-studio:viewer.filter-states', { count }),
  bodyOnly: t('views-player-sprite-studio:viewer.body-only'),
  sheetSize: (cols, rows, width, height) => t('views-player-sprite-studio:viewer.sheet-size', { cols, rows, width, height }),
  wearing: t('views-player-sprite-studio:viewer.wearing'),
  gloves: t('views-player-sprite-studio:viewer.gloves'),
  outfitName: (outfit) => outfitName(outfit, t),
  gloveName: (gloves) => t(`views-player-sprite-studio:glove.name.${GLOVE_KEYS[gloves]}` as MessageKey),
});

export { viewerLabelsOf };
