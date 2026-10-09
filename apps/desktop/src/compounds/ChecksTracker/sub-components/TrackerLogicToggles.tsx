/* @layer renderer-components @kind component */
import { smallKeyDoorsOf } from '@rotp/game-data';
import { Button } from '@drizztdourden08/tessera/primitives';
import type { TrackerLogicTogglesProps } from '../ChecksTracker.type';

const TrackerLogicToggles = ({ filter, onFilterChange, run }: TrackerLogicTogglesProps) => {
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
        title="On: rows past a key door wait for the keys the logic counts. Off: every small key door reads as open"
        onClick={() => onFilterChange({ ...filter, smallKeyDoors: !smallKeyDoors })}
      >
        Small Keys
      </Button>
      <Button
        variant="tertiary"
        size="sm"
        active={bigKeyDoors}
        title="On: rows past a Big Key door wait for the key. Off: every Big Key door reads as open"
        onClick={() => onFilterChange({ ...filter, bigKeyDoors: !bigKeyDoors })}
      >
        Big Keys
      </Button>
      <Button
        variant="tertiary"
        size="sm"
        active={darkRoomsNeedLight}
        title="On: rows past an unlit room wait for a light. Off: unlit rooms read as walked in the dark"
        onClick={() => onFilterChange({ ...filter, darkRoomsNeedLight: !darkRoomsNeedLight })}
      >
        Dark Rooms
      </Button>
      {plainGame && (
        <Button
          variant="tertiary"
          size="sm"
          active={shopShelves}
          title="On: every shop shelf is listed as a row. Off: a shelf is a shop item, not a check"
          onClick={() => onFilterChange({ ...filter, shopShelves: !shopShelves })}
        >
          Shops
        </Button>
      )}
    </>
  );
};

export { TrackerLogicToggles };
export type { TrackerLogicTogglesProps };
