/* @layer renderer-components @kind component */
/**
 * A list whose elements are plain records: each one opened as its own small
 * form, with the same add, remove and reorder the list of values gets.
 *
 * The original reason a list of records stayed read-only was about VARIANTS —
 * no element form, no stable identity, no answer to "add what" when the element
 * could be any of several shapes. None of that holds for one well-defined
 * shape: the form is the element's own children, "add what" is a blank of that
 * shape, and identity is the index, exactly as it already is for a list of
 * values. A list of variants, of lists, or of nothing described keeps the
 * summary, because for those the original reasoning still stands.
 *
 * Rows recurse through `EditorRow`, so an element's fields are edited by the
 * very same controls they would get at the top level — a reference inside an
 * element gets the real picker, a number gets the real bounds — rather than by
 * a second, lesser set of controls maintained here.
 */
import { Box } from '../../../primitives/Box';
import { Button } from '../../../primitives/Button';
import { Flex } from '../../../primitives/Flex';
import { IconButton } from '../../../primitives/IconButton';
import { Text } from '../../../primitives/Text';
import { toList } from '../../field-kits/coerce';
import { countLabel } from '../../field-kits/summary';
import { blankValue, elementFields, moved } from '../behavior/array-elements';
import { EditorRow } from './EditorRow';
import type { ObjectArrayEditorProps } from '../RecordEditor.type';
import '../RecordEditor.css';

const UP = '↑';
const DOWN = '↓';
const REMOVE = '×';
const ADD = '+ Add';

const ObjectArrayEditor = (props: ObjectArrayEditorProps) => {
  const { field, value, binding, depth } = props;
  const element = field.of;
  if (!element?.children?.length) return null;

  const list = toList(value);
  const { disabled } = binding;
  const write = (next: readonly unknown[]): void => binding.onChange(field.path, next);

  return (
    <Flex className="record-editor__array" direction="column" gap="sm">
      {!list.length && <Text className="record-editor__empty">{countLabel(0)}</Text>}
      {list.map((_entry, index) => (
        <Box key={`${field.path}.${index}`} className="record-editor__array-item">
          <Flex className="record-editor__array-item-head" gap="xs" align="center">
            <Text as="span" className="record-editor__array-index">{`#${index + 1}`}</Text>
            <IconButton
              label="Move up"
              disabled={disabled || index === 0}
              onClick={() => write(moved(list, index, index - 1))}
            >
              {UP}
            </IconButton>
            <IconButton
              label="Move down"
              disabled={disabled || index === list.length - 1}
              onClick={() => write(moved(list, index, index + 1))}
            >
              {DOWN}
            </IconButton>
            <IconButton
              label="Remove"
              variant="danger"
              disabled={disabled}
              onClick={() => write(list.filter((_held, at) => at !== index))}
            >
              {REMOVE}
            </IconButton>
          </Flex>
          <Box className="record-editor__nested">
            {elementFields(field, index).map((child) => (
              <EditorRow key={child.path} field={child} binding={binding} depth={depth + 1} />
            ))}
          </Box>
        </Box>
      ))}
      <Flex justify="start">
        <Button
          size="sm"
          variant="tertiary"
          disabled={disabled}
          onClick={() => write([...list, blankValue(element)])}
        >
          {ADD}
        </Button>
      </Flex>
    </Flex>
  );
};

export { ObjectArrayEditor };
