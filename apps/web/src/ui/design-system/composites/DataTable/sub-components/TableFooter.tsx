/* @layer renderer-components @kind component */
/**
 * The strip under the grid: what the table is sorted/grouped by on the left,
 * how many rows are in it and the table's own options button on the right.
 *
 * The count lives here rather than above the table, and rather than in each
 * caller: the table is the thing that knows how many rows it is showing, and
 * the space beneath a table is where a count is looked for. The summary joins
 * it for the same reason — it used to be repeated in every column's own ⋯
 * menu, and a fact about the whole table belongs said once, in the same strip
 * that already reports the table's row count.
 */
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import { summaryLine } from '../behavior/sort-group-summary';
import { TableOptionsMenu } from './TableOptionsMenu';
import type { PickerNode } from '../behavior/field-picker-nodes';
import type { SortGroupSummary } from '../behavior/sort-group-summary';
import type { TableActions } from '../DataTable.type';
import './TableFooter.css';

interface TableFooterProps {
  count: number;
  /** Singular / plural noun for a row, when "entry" is the wrong word. */
  countLabel?: readonly [one: string, many: string];
  sortActive: boolean;
  groupActive: boolean;
  /** The addable field tree — the options menu offers it as an append. */
  fieldNodes?: readonly PickerNode[];
  actions: TableActions;
  /** What the whole table is sorted and grouped by, in words — see `sort-group-summary`. */
  summary: SortGroupSummary;
}

const DEFAULT_COUNT_LABEL: readonly [string, string] = ['entry', 'entries'];

const TableFooter = (props: TableFooterProps) => {
  const {
    count, countLabel = DEFAULT_COUNT_LABEL, sortActive, groupActive, fieldNodes, actions, summary,
  } = props;
  const noun = count === 1 ? countLabel[0] : countLabel[1];
  const line = summaryLine(summary);

  return (
    <Box className="data-table__footer">
      {/* Always show the summary: either the active sort/group, or a placeholder
          to keep the right side (count + menu) from shifting when empty. */}
      <Text className="data-table__summary">{line}</Text>
      <Box className="data-table__footer-right">
        <Text className="data-table__count">{`${count} ${noun}`}</Text>
        <TableOptionsMenu
          sortActive={sortActive}
          groupActive={groupActive}
          fieldNodes={fieldNodes}
          actions={actions}
        />
      </Box>
    </Box>
  );
};

export { TableFooter };
export type { TableFooterProps };
