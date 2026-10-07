/* @layer renderer-components @kind component */
/**
 * One grouping level's header. Indentation is computed from `level`. The field
 * label and row count are pinned at the far right through horizontal scroll;
 * see `.data-table__group-total` in DataTable.css.
 */
import { Badge } from '../../../primitives/Badge';
import { Box } from '../../../primitives/Box';
import { Button } from '../../../primitives/Button';
import { Text } from '../../../primitives/Text';
import { groupKeyContent } from '../behavior/cell-content';
import type { CSSProperties } from 'react';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';
import type { DisplaySubstitution } from '../behavior/display-substitution';

interface GroupRowProps {
  level: number;
  groupKey: string;
  field?: FieldDescriptor;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  /** The same reference substitution its cells get, so the header agrees with the rows. */
  display?: DisplaySubstitution;
}

const INDENT_STEP = 'var(--space-lg)';

const GroupRow = (props: GroupRowProps) => {
  const { level, groupKey, field, count, expanded, onToggle, display } = props;
  // Depth is data, so the indent is computed, not a class.
  const indent: CSSProperties = { paddingLeft: `calc(${INDENT_STEP} * ${level + 1})` };

  return (
    <Box className="data-table__group" style={indent} role="row">
      <Button
        variant="bare"
        size="sm"
        className="data-table__group-toggle"
        aria-label={expanded ? 'Collapse group' : 'Expand group'}
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <Text className="data-table__chevron">{expanded ? '▾' : '▸'}</Text>
        <Text className="data-table__group-key">{groupKeyContent(groupKey, field, display)}</Text>
      </Button>
      <Box className="data-table__group-total">
        {field && <Text className="data-table__group-field">{field.label}</Text>}
        <Badge variant="neutral" className="data-table__group-count">{String(count)}</Badge>
      </Box>
    </Box>
  );
};

export { GroupRow };
export type { GroupRowProps };
