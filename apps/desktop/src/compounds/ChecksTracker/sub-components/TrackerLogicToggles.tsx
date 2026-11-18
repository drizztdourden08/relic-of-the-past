/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { smallKeyDoorsOf } from '@rotp/game-data';
import { Button } from '@drizztdourden08/tessera/primitives';
import type { TrackerLogicTogglesProps } from '../ChecksTracker.type';

const TrackerLogicToggles = ({ filter, onFilterChange, run }: TrackerLogicTogglesProps) => {
  const t = useT();
  const bigKeyDoors = filter.bigKeyDoors ?? true;
  const smallKeyDoors = smallKeyDoorsOf(filter, run);
  const darkRoomsNeedLight = filter.darkRoomsNeedLight ?? true;
  const shopShelves = filter.shopShelves ?? false;
  const plainGame = (run?.kind ?? 'normal') === 'normal';
  return (
    <>
      <Button
        variant="tertiary"
        size="sm"
        active={smallKeyDoors}
        title={t('compounds:tracker.logic.small-keys-title')}
        onClick={() => onFilterChange({ ...filter, smallKeyDoors: !smallKeyDoors })}
      >
        {t('compounds:tracker.logic.small-keys')}
      </Button>
      <Button
        variant="tertiary"
        size="sm"
        active={bigKeyDoors}
        title={t('compounds:tracker.logic.big-keys-title')}
        onClick={() => onFilterChange({ ...filter, bigKeyDoors: !bigKeyDoors })}
      >
        {t('compounds:tracker.logic.big-keys')}
      </Button>
      <Button
        variant="tertiary"
        size="sm"
        active={darkRoomsNeedLight}
        title={t('compounds:tracker.logic.dark-rooms-title')}
        onClick={() => onFilterChange({ ...filter, darkRoomsNeedLight: !darkRoomsNeedLight })}
      >
        {t('compounds:tracker.logic.dark-rooms')}
      </Button>
      {plainGame && (
        <Button
          variant="tertiary"
          size="sm"
          active={shopShelves}
          title={t('compounds:tracker.logic.shops-title')}
          onClick={() => onFilterChange({ ...filter, shopShelves: !shopShelves })}
        >
          {t('compounds:tracker.logic.shops')}
        </Button>
      )}
    </>
  );
};

export { TrackerLogicToggles };
