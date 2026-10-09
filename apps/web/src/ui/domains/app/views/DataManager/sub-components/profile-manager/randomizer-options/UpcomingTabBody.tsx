/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { LockedRowsSection } from './LockedRowsSection';
import type { UpcomingTabBodyProps } from './UpcomingTabBody.type';

const UpcomingTabBody = (props: UpcomingTabBodyProps) => {
  const { title, groups, valueOf, cellOf, readout } = props;

  if (groups.length === 0) return <Text variant="caption">{title}</Text>;

  return (
    <LockedRowsSection
      title={title}
      groups={groups}
      valueOf={valueOf}
      cellOf={cellOf}
      readout={readout}
    />
  );
};

export { UpcomingTabBody };
