/* @layer renderer-components @kind component */
/**
 * One filter clause: the field's name as a caption, and the comparison itself
 * directly under it. Nothing is drawn around the pair — no box, no fill, no
 * padding — because the control already has its own edges and a second set
 * around them only costs room. Clauses are narrow and wrap (see FilterBar.css),
 * so several filters read as several small things side by side rather than one
 * full-width line each.
 *
 * The comparison is one merged control strip: the enable box, the operator
 * button and the field kind's own filter control are three segments of a
 * single bordered group — no gap, rounding only on the outer corners.
 *
 * The field's name is written once, in the caption. The enable box carries no
 * visible text of its own because of that, and keeps the name in its
 * accessible label instead: on its own it is a tick with nothing to say.
 *
 * Removing acts on the whole clause rather than on the comparison, so it is
 * not given a segment of its own: it is pinned to the strip's top-right corner
 * (positioned by FilterBar.css, which is why it is the strip's last child) and
 * stays out of sight until the clause is hovered or something in it takes
 * focus. Last child also means last tab stop, so the destructive control is
 * not the first thing keyboard focus lands on.
 *
 * A clause stays in the list when disabled — see FilterClause.enabled — so
 * unchecking never loses it. Disabling greys the comparison and leaves it
 * editable: a clause you switched off is usually one you mean to switch
 * back on, and setting up a filter before arming it is a normal thing to do.
 * Only the enable box stays at full strength, since it is the way back.
 *
 * The control region collapses when the current operator's arity is 'none'
 * (e.g. boolean's isTrue/isFalse, or object/union's isEmpty/isNotEmpty): those
 * operators take no operand, so there is nothing for a control to edit. This
 * is decided here rather than trusted to each kit, because at least one kit
 * (array, for its own isEmpty/isNotEmpty) does not yet collapse on its own —
 * and the operator button has to know, since without a control it is the
 * segment that ends the strip.
 */
import { Box } from '../../../primitives/Box';
import { Checkbox } from '../../../primitives/Checkbox';
import { Flex } from '../../../primitives/Flex';
import { IconButton } from '../../../primitives/IconButton';
import { Text } from '../../../primitives/Text';
import { findOperator } from '../../../data/filter/operators';
import { resolveFieldKit } from '../../field-kits';
import { OperatorMenu } from './OperatorMenu';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';
import type { FilterClause } from '../../../data/filter/clause';
import '../FilterBar.css';

interface FilterClauseCardProps {
  field: FieldDescriptor;
  clause: FilterClause;
  onChangeOperator: (nextOp: string) => void;
  onChangeValue: (nextValue: unknown) => void;
  onToggleEnabled: (enabled: boolean) => void;
  onRemove: () => void;
  /** Omitted where the case modifier should not be offered. */
  onChangeCaseSensitive?: (next: boolean) => void;
}

const FilterClauseCard = (props: FilterClauseCardProps) => {
  const {
    field, clause, onChangeOperator, onChangeValue, onToggleEnabled, onRemove, onChangeCaseSensitive,
  } = props;
  const kit = resolveFieldKit(field.kind);
  const arity = findOperator(field.kind, clause.op)?.arity;
  const FilterControl = arity === 'none' ? undefined : kit?.FilterControl;

  const clauseClass = `filter-bar__clause${clause.enabled ? '' : ' filter-bar__clause--disabled'}`;
  const groupClass = `filter-bar__group${FilterControl ? '' : ' filter-bar__group--no-control'}`;

  return (
    <Box className={clauseClass}>
      <Text className="filter-bar__field-label" title={field.label}>{field.label}</Text>
      <Flex align="stretch" className={groupClass}>
        <Checkbox
          className="filter-bar__check"
          checked={clause.enabled}
          ariaLabel={`Apply the ${field.label} filter`}
          onChange={onToggleEnabled}
        />
        <OperatorMenu
          field={field}
          op={clause.op}
          caseSensitive={clause.caseSensitive}
          onChange={onChangeOperator}
          onChangeCaseSensitive={onChangeCaseSensitive}
        />
        {FilterControl && (
          <Box className="filter-bar__control">
            <FilterControl field={field} op={clause.op} value={clause.value} onChange={onChangeValue} />
          </Box>
        )}
        <IconButton
          variant="danger"
          size="sm"
          className="filter-bar__remove"
          label={`Remove filter on ${field.label}`}
          onClick={onRemove}
        >
          ✕
        </IconButton>
      </Flex>
    </Box>
  );
};

export { FilterClauseCard };
export type { FilterClauseCardProps };
