/* @layer renderer-components @kind component */
import { Badge, formatDate } from '@drizztdourden08/tessera/primitives';
import { DateText, ListItemRow } from '@drizztdourden08/tessera/composites';
import { formatDuration } from './behavior/format-duration';
import { type PlaySessionCardProps } from './PlaySessionCard.type';

const PlaySessionCard = (props: PlaySessionCardProps) => {
  const { session, dates, endLabel } = props;

  return (
    <ListItemRow
      icon={<Badge variant="dot" color="primary" />}
      name={<DateText value={session.startedAt} format="calendar" />}
      meta={session.endedAt ? endLabel(formatDate(session.endedAt, 'time', dates)) : undefined}
      columns={[{ primary: formatDuration(session.durationMs), align: 'end' }]}
    />
  );
};

export {
  PlaySessionCard,
};
