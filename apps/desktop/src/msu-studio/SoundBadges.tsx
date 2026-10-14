/* @layer renderer-components @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import { AMBIENT_ROLE_HINTS, AMBIENT_ROLE_LABELS } from './msu.constants';
import type { SoundBadgesProps } from './SoundBadges.type';

const SoundBadges = (props: SoundBadgesProps) => {
  const { row, chipAudible } = props;
  const { layerCount, role, unreachable } = row;
  const replaced = layerCount > 0;

  return (
    <>
      {role !== null && (
        <Status tone="neutral" title={AMBIENT_ROLE_HINTS[role]}>{AMBIENT_ROLE_LABELS[role]}</Status>
      )}
      {unreachable && (
        <Status tone="warning" title="Nothing in the game writes this id, so a sound put here never plays">
          Never raised
        </Status>
      )}

      <Status tone={replaced ? 'success' : 'neutral'}>{replaced ? 'Replaced' : 'Native'}</Status>
      {layerCount > 1 && <Status tone="neutral">{layerCount} layers</Status>}
      {chipAudible === false && !replaced && <Status tone="neutral">Silent</Status>}
    </>
  );
};

export { SoundBadges };
