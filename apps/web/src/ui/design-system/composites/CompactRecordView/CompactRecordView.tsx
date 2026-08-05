/* @layer renderer-components @kind component */
/**
 * A read-only, one-line-per-field property sheet for a single record — the
 * same schema-derived grouping `RecordEditor` shows, with every field kit's
 * own compact `renderCell` on the right instead of a live control. Built for a
 * floating widget panel a few hundred pixels wide, so it is closer to a
 * glanceable summary than a smaller editor: nothing here is interactive beyond
 * whatever tooltip the kit already carries, and there is no save, no dirty
 * state — `resolveIdRefDisplay` is the one lookup it takes, purely cosmetic,
 * for showing a reference field's name instead of its raw id.
 *
 * Layout is `layoutGroups`, unchanged — a group label only appears once there
 * is more than one group, since a single unnamed set needs no heading. The
 * optional `groups` prop narrows that layout further (see `filterGroups`),
 * which is how a caller keeps a wide collection down to the handful of fields
 * that actually fit.
 */
import { useMemo } from 'react';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { layoutGroups } from '../RecordEditor';
import { filterGroups } from './behavior/filter-groups';
import { CompactField } from './sub-components/CompactField';
import type { CompactRecordViewProps } from './CompactRecordView.type';
import './CompactRecordView.css';

const NO_FIELDS = 'This record has no fields to show.';

const CompactRecordView = <T,>(props: CompactRecordViewProps<T>) => {
  const { record, schema, config, groups, resolveIdRefDisplay, diffs } = props;
  const laidOut = useMemo(() => layoutGroups(schema, config), [schema, config]);
  const shown = useMemo(() => filterGroups(laidOut, groups), [laidOut, groups]);
  const showLabels = shown.length > 1;

  return (
    <Box className="compact-record-view">
      {shown.length === 0 && <Text className="compact-record-view__empty">{NO_FIELDS}</Text>}
      {shown.map((group) => (
        <Box key={group.id} className="compact-record-view__group">
          {showLabels && (
            <Text className="compact-record-view__group-label">{group.label ?? group.id}</Text>
          )}
          {group.fields.map((field) => (
            <CompactField
              key={field.path}
              record={record}
              field={field}
              depth={0}
              resolveIdRefDisplay={resolveIdRefDisplay}
              diffs={diffs}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export { CompactRecordView };
