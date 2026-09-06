/* @layer renderer-components @kind component */
/**
 * A list of variant records (a requirement's `anyOf`/`allOf`). Branch
 * detection reuses `detectUnionBranch`; what is new is the list plumbing and a
 * branch picker per element. An unresolved element shows the picker with
 * nothing selected and no rows below it.
 */
import { Box } from '../../../primitives/Box';
import { Button } from '../../../primitives/Button';
import { Flex } from '../../../primitives/Flex';
import { IconButton } from '../../../primitives/IconButton';
import { Select } from '../../../primitives/Select';
import { Text } from '../../../primitives/Text';
import { toList } from '../../field-kits/coerce';
import { countLabel } from '../../field-kits/summary';
import { blankValue, moved, rebaseField } from '../behavior/array-elements';
import { detectUnionBranch, keyOf } from '../behavior/union-branch';
import { EditorRow } from './EditorRow';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';
import type { ObjectArrayEditorProps } from '../RecordEditor.type';
import '../RecordEditor.css';

const UP = '↑';
const DOWN = '↓';
const REMOVE = '×';
const ADD = '+ Add';
const NO_BRANCH = 'Choose a shape for this item.';

const branchOptions = (branches: readonly FieldDescriptor[]) =>
  branches.map((branch) => ({ value: keyOf(branch), label: branch.label }));

const blankBranchValue = (branch: FieldDescriptor): unknown => ({ [keyOf(branch)]: blankValue(branch) });

const VariantArrayEditor = (props: ObjectArrayEditorProps) => {
  const { field, value, binding, depth } = props;
  const element = field.of;
  if (!element?.children?.length) return null;
  const branches = element.children;

  const list = toList(value);
  const { disabled } = binding;
  const write = (next: readonly unknown[]): void => binding.onChange(field.path, next);

  const setBranch = (index: number, branchKey: string): void => {
    const branch = branches.find((entry) => keyOf(entry) === branchKey);
    if (!branch) return;
    write(list.map((held, at) => (at === index ? blankBranchValue(branch) : held)));
  };

  return (
    <Flex className="record-editor__array" direction="column" gap="sm">
      {!list.length && <Text className="record-editor__empty">{countLabel(0)}</Text>}
      {list.map((entry, index) => {
        const address = `${field.path}.${index}`;
        const rebased = rebaseField(element, element.path, address);
        const branch = detectUnionBranch(rebased, entry);
        const currentKey = branch.status === 'resolved' && branch.fields.length
          ? keyOf(branch.fields[0])
          : '';

        return (
          <Box key={address} className="record-editor__array-item">
            <Flex className="record-editor__array-item-head" gap="xs" align="center">
              <Text as="span" className="record-editor__array-index">{`#${index + 1}`}</Text>
              <Select
                size="sm"
                value={currentKey}
                placeholder="Shape..."
                disabled={disabled}
                options={branchOptions(branches)}
                onChange={(next) => setBranch(index, next)}
              />
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
            {branch.status === 'resolved'
              ? (
                <Box className="record-editor__nested">
                  {branch.fields.map((child) => (
                    <EditorRow key={child.path} field={child} binding={binding} depth={depth + 1} />
                  ))}
                </Box>
              )
              : <Text className="record-editor__note">{NO_BRANCH}</Text>}
          </Box>
        );
      })}
      <Flex justify="start">
        <Button
          size="sm"
          variant="tertiary"
          disabled={disabled}
          onClick={() => write([...list, blankBranchValue(branches[0])])}
        >
          {ADD}
        </Button>
      </Flex>
    </Flex>
  );
};

export { VariantArrayEditor };
