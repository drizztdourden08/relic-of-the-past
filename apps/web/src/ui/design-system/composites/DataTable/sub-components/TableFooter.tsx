/* @layer renderer-components @kind component */
/** The strip under the grid: sort/group summary on the left, row count and the table's options button on the right. */
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
  /** The addable field tree. The options menu offers it as an append. */
  fieldNodes?: readonly PickerNode[];
  actions: TableActions;
  /** What the whole table is sorted and grouped by, in words. See `sort-group-summary`. */
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
      {/* Always shown; the placeholder keeps the right side from shifting. */}
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
