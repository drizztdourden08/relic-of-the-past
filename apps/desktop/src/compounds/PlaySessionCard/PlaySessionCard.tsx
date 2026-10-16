/* @layer renderer-components @kind component */
import { Badge } from '@drizztdourden08/tessera/primitives';
import { DateText, ListItemRow } from '@drizztdourden08/tessera/composites';
import { formatDuration } from './behavior/format-duration';
import { type PlaySessionCardProps } from './PlaySessionCard.type';

const endTimeOf = (endedAt: number): string =>
  `to ${new Date(endedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;

const PlaySessionCard = (props: PlaySessionCardProps) => {
  const { session } = props;

  return (
    <ListItemRow
      icon={<Badge variant="dot" color="primary" />}
      name={<DateText value={session.startedAt} format="calendar" />}
      meta={session.endedAt ? endTimeOf(session.endedAt) : undefined}
      columns={[{ primary: formatDuration(session.durationMs), align: 'end' }]}
    />
  );
};

export {
  PlaySessionCard,
};
