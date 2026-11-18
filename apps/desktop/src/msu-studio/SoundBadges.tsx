/* @layer renderer-components @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import { useT, useText } from '@drizztdourden08/brock-react';
import { AMBIENT_ROLE_HINTS, AMBIENT_ROLE_LABELS } from './msu.constants';
import type { SoundBadgesProps } from './SoundBadges.type';

const SoundBadges = (props: SoundBadgesProps) => {
  const { row, chipAudible } = props;
  const { layerCount, role, unreachable } = row;
  const t = useT();
  const text = useText();
  const replaced = layerCount > 0;

  return (
    <>
      {role !== null && (
        <Status tone="neutral" title={text(AMBIENT_ROLE_HINTS[role])}>
          {text(AMBIENT_ROLE_LABELS[role])}
        </Status>
      )}
      {unreachable && (
        <Status tone="warning" title={t('msu-studio:sound.badge.never-raised-title')}>
          {t('msu-studio:sound.badge.never-raised')}
        </Status>
      )}

      <Status tone={replaced ? 'success' : 'neutral'}>{replaced ? t('msu-studio:sound.badge.replaced') : t('msu-studio:sound.badge.native')}</Status>
      {layerCount > 1 && <Status tone="neutral">{t('msu-studio:layer.count', { count: layerCount })}</Status>}
      {chipAudible === false && !replaced && <Status tone="neutral">{t('msu-studio:sound.badge.silent')}</Status>}
    </>
  );
};

export { SoundBadges };
