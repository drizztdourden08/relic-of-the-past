/* @layer renderer-hooks @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SpriteStatusLine, SpriteStatusProps } from '../PlayerSpriteStudio.type';

const spriteStatusOf = (props: SpriteStatusProps, t: I18n['t']): SpriteStatusLine | null => {
  const { isNew, dirty, applied, readOnly, exportStatus, error } = props;
  if (error) return { tone: 'danger', text: error };
  if (readOnly) return { tone: 'neutral', text: t('views-player-sprite-studio:status.readOnly') };
  if (isNew) return { tone: 'warning', text: t('views-player-sprite-studio:status.notSaved') };
  if (dirty) return { tone: 'warning', text: t('views-player-sprite-studio:status.unsaved') };
  if (exportStatus) return { tone: 'info', text: exportStatus };
  if (applied === true) return { tone: 'success', text: t('views-player-sprite-studio:status.applied') };
  if (applied === false) return { tone: 'info', text: t('views-player-sprite-studio:status.appliesNextBoot') };
  return null;
};

export { spriteStatusOf };
