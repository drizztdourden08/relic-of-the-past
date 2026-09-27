/* @layer renderer-components @kind component */
/**
 * The drawer's on/off switches over what the list holds and how its logic reads: small key
 * doors, Big Key doors, unlit rooms, and on the plain game the shop shelves. A seed's roster
 * already carries only the shelves its shop scope opened, so that switch shows on the plain
 * game only. Small keys default off on the plain game and on for a seed (smallKeyDoorsOf).
 */
import { smallKeyDoorsOf } from '@shared/game/logic/queries/check-grouping';
import type { FilterState, RunContext } from '@shared/game/logic/queries/check-grouping';
import { Button } from '@ds/primitives';

interface TrackerLogicTogglesProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  run?: RunContext;
}

/** How many of the switches are away from their default, for the drawer's badge. */
const activeLogicToggles = (filter: FilterState, run?: RunContext): number =>
  ((filter.bigKeyDoors ?? true) ? 0 : 1) + ((filter.darkRoomsNeedLight ?? true) ? 0 : 1) + ((filter.shopShelves ?? false) ? 1 : 0)
  + (smallKeyDoorsOf(filter, run) === smallKeyDoorsOf({ ...filter, smallKeyDoors: undefined }, run) ? 0 : 1);

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

export { activeLogicToggles, TrackerLogicToggles };
export type { TrackerLogicTogglesProps };
