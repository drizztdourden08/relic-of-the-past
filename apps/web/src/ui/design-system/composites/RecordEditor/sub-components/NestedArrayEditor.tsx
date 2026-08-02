/* @layer renderer-components @kind component */
/**
 * A list of lists of plain values — an OR-of-AND requirement set is the case
 * this exists for (`[['sword'], ['boomerang']]` reads "sword OR boomerang"),
 * but the shape itself is generic: any array whose element is ITSELF an array
 * of single values.
 *
 * One inner list per outer entry, laid out the same way `ArrayFieldEditor`
 * lays out a flat list — add and remove at both levels is the whole edit, so
 * there is no reorder here the way the object/variant list editors have: an
 * OR-of-AND set carries no meaning in the order its branches are tried.
 */
import { Box } from '../../../primitives/Box';
import { Button } from '../../../primitives/Button';
import { Flex } from '../../../primitives/Flex';
import { IconButton } from '../../../primitives/IconButton';
import { Text } from '../../../primitives/Text';
import { toList } from '../../field-kits/coerce';
import { countLabel } from '../../field-kits/summary';
import { blankFor } from '../behavior/array-elements';
import { resolveFieldKit } from '../../field-kits';
import type { ArrayFieldEditorProps } from '../RecordEditor.type';
import '../RecordEditor.css';

const REMOVE = '×';
const ADD_INNER = '+ Add value';
const ADD_OUTER = '+ Add group';

const NestedArrayEditor = (props: ArrayFieldEditorProps) => {
  const { field, value, binding } = props;
  const outer = field.of;
  const inner = outer?.kind === 'array' ? outer.of : undefined;
  const kit = inner ? resolveFieldKit(inner.kind) : undefined;
  if (!outer || !inner || !kit) return null;

  const rows = toList(value).map(toList);
  const { disabled } = binding;
  const write = (next: readonly (readonly unknown[])[]): void => binding.onChange(field.path, next);
  const ElementControl = kit.EditorControl;

  return (
    <Flex className="record-editor__array" direction="column" gap="sm">
      {!rows.length && <Text className="record-editor__empty">{countLabel(0)}</Text>}
      {rows.map((row, outerIndex) => (
        <Box key={`${field.path}.${outerIndex}`} className="record-editor__array-item">
          <Flex className="record-editor__array-item-head" gap="xs" align="center">
            <Text as="span" className="record-editor__array-index">{`#${outerIndex + 1}`}</Text>
            <IconButton
              label="Remove"
              variant="danger"
              disabled={disabled}
              onClick={() => write(rows.filter((_held, at) => at !== outerIndex))}
            >
              {REMOVE}
            </IconButton>
          </Flex>
          <Flex direction="column" gap="xs" className="record-editor__nested">
            {!row.length && <Text className="record-editor__empty">{countLabel(0)}</Text>}
            {row.map((entry, innerIndex) => (
              <Flex key={`${field.path}.${outerIndex}.${innerIndex}`} gap="xs" align="center">
                <ElementControl
                  field={inner}
                  value={entry}
                  disabled={disabled}
                  resolveIdRefOptions={binding.resolveIdRefOptions}
                  onChange={(next) => write(rows.map(
                    (heldRow, atOuter) => (atOuter === outerIndex
                      ? heldRow.map((held, atInner) => (atInner === innerIndex ? next : held))
                      : heldRow),
                  ))}
                />
                <IconButton
                  label="Remove"
                  variant="danger"
                  disabled={disabled}
                  onClick={() => write(rows.map(
                    (heldRow, atOuter) => (atOuter === outerIndex
                      ? heldRow.filter((_held, atInner) => atInner !== innerIndex)
                      : heldRow),
                  ))}
                >
                  {REMOVE}
                </IconButton>
              </Flex>
            ))}
            <Flex justify="start">
              <Button
                size="sm"
                variant="tertiary"
                disabled={disabled}
                onClick={() => write(rows.map(
                  (heldRow, atOuter) => (atOuter === outerIndex ? [...heldRow, blankFor(inner)] : heldRow),
                ))}
              >
                {ADD_INNER}
              </Button>
            </Flex>
          </Flex>
        </Box>
      ))}
      <Flex justify="start">
        <Button size="sm" variant="tertiary" disabled={disabled} onClick={() => write([...rows, []])}>
          {ADD_OUTER}
        </Button>
      </Flex>
    </Flex>
  );
};

export { NestedArrayEditor };
