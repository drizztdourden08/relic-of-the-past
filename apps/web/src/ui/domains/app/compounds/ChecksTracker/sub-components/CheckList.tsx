/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives';
import { shownItemsOf } from '@shared/game/logic/queries/check-contents';
import { CheckCard } from './CheckCard';
import { TrackerCheckRow } from './TrackerCheckRow';
import type { CheckListProps } from '../ChecksTracker.type';
import '../ChecksTracker.css';

const CheckList = (props: CheckListProps) => {
  const { checks, statuses, eventStatus, viewMode, run } = props;
  const showsItem = viewMode !== 'compact';

  if (viewMode === 'visual') {
    return (
      <Box className="tracker-checks--visual">
        {checks.flatMap((check) => {
          const status = statuses.get(check.id) ?? 'blocked';
          return shownItemsOf({ check, run, expand: true }).map((itemId, i) => (
            <CheckCard
              key={`${check.id}__${i}`} check={check} status={status} item={itemId}
              foreignItem={run?.foreignItems?.get(check.id)} now={eventStatus?.get(check.id)}
            />
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
            foreignItem={run?.foreignItems?.get(check.id)}
          />
        ));
      })}
    </Box>
  );
};

export { CheckList };
export type { CheckListProps };
