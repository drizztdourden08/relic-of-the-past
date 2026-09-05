/* @layer renderer-components @kind component */
/**
 * A list of plain records, each opened as its own small form with add, remove
 * and reorder. Rows recurse through `EditorRow`, so an element's fields get
 * the same controls they would at the top level.
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
