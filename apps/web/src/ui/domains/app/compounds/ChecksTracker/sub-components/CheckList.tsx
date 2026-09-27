/* @layer renderer-components @kind component */
/**
 * The leaves of the check tree, in the three view modes.
 *
 * A check with several vanilla items expands to one entry per item in the
 * modes that show the item, but only WITHOUT a run: once a seed has placed
 * something there, the check holds exactly one thing, so it collapses back to
 * a single row showing that.
 */
import { Box } from '@ds/primitives';
import type { CheckRecord } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic';
import { shownItemsOf } from '@shared/game/logic/queries/check-contents';
import type { RunContext } from '@shared/game/logic/queries/check-grouping';
import { CheckCard } from './CheckCard';
import { TrackerCheckRow } from './TrackerCheckRow';
import type { ViewMode } from '../ChecksTracker.type';
import '../ChecksTracker.css';

interface CheckListProps {
  checks: CheckRecord[];
  statuses: Map<string, CheckStatus>;
  eventStatus?: ReadonlyMap<string, boolean>;
  viewMode: ViewMode;
  run?: RunContext;
}

const CheckList = (props: CheckListProps) => {
  const { checks, statuses, eventStatus, viewMode, run } = props;
  const showsItem = viewMode !== 'compact';

  if (viewMode === 'visual') {
    return (
      <Box className="tracker-checks--visual">
        {checks.flatMap((check) => {
          const status = statuses.get(check.id) ?? 'blocked';
          return shownItemsOf({ check, run, expand: true }).map((itemId, i) => (
            <CheckCard key={`${check.id}__${i}`} check={check} status={status} item={itemId} now={eventStatus?.get(check.id)} />
          ));
        })}
      </Box>
    );
  }

  return (
    <Box className="tracker-checks--list">
      {checks.flatMap((check) => {
        const status = statuses.get(check.id) ?? 'blocked';
        return shownItemsOf({ check, run, expand: showsItem }).map((itemId, i) => (
          <TrackerCheckRow
            key={`${check.id}__${i}`}
            check={check}
            status={status}
            now={eventStatus?.get(check.id)}
            detailed={showsItem}
            item={itemId}
          />
        ));
      })}
    </Box>
  );
};

export { CheckList };
export type { CheckListProps };
