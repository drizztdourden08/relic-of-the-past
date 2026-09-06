/* @layer renderer-components @kind component */
/**
 * A tab whose whole subject is still to be built. Whatever rows the catalog
 * already carries for it are shown under the one heading, locked and
 * disabled exactly as the catalog defines them; a tab with no rows yet is
 * that heading on its own, an honest empty page rather than a heading over
 * nothing.
 */
import { Text } from '@ds/primitives';
import { LockedRowsSection } from './LockedRowsSection';
import type { LockedOptionGroup } from '@domains/app/compounds/RandomizerOptionRow';
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type { ApOptionDef, ApOptionValue } from '@shared/randomizer/ap-world/options.type';

interface UpcomingTabBodyProps {
  /** The one line the tab shows, and the heading its rows sit under when there are any. */
  title: string;
  /** The catalog rows already filed under this subject; empty is expected. */
  groups: readonly LockedOptionGroup[];
  valueOf: (option: ApOptionDef) => ApOptionValue;
  cellOf: (key: string) => ImpactCell;
}

const UpcomingTabBody = (props: UpcomingTabBodyProps) => {
  const { title, groups, valueOf, cellOf } = props;

  if (groups.length === 0) return <Text variant="caption">{title}</Text>;

  return (
    <LockedRowsSection
      title={title}
      groups={groups}
      valueOf={valueOf}
      cellOf={cellOf}
    />
  );
};

export { UpcomingTabBody };
export type { UpcomingTabBodyProps };
