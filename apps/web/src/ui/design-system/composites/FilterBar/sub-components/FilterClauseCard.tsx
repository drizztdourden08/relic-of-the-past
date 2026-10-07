/* @layer renderer-components @kind component */
/**
 * One filter clause: a caption and a merged control strip (enable box,
 * operator button, the kind's filter control). The remove badge is the strip's
 * last child so FilterBar.css can pin it to the corner and so it is the last
 * tab stop. A disabled clause stays in the list and stays editable. The
 * control collapses when the operator's arity is 'none'; decided here, not by
 * each kit, because the array kit does not collapse on its own and the
 * operator button must know it ends the strip.
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
