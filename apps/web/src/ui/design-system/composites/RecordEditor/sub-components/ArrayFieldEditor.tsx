/* @layer renderer-components @kind component */
/**
 * Add, remove and reorder for a list of single values. Every operation writes
 * the whole array through the field's path. Two element kinds opt out of the
 * rows: a closed set is a selection, not a sequence, so it gets one chip row;
 * a tag list is the same with an open set, so it goes to the tag entry.
 */
import { Button } from '../../../primitives/Button';
import { Flex } from '../../../primitives/Flex';
import { IconButton } from '../../../primitives/IconButton';
import { Text } from '../../../primitives/Text';
import { toList, toText } from '../../field-kits/coerce';
import { countLabel } from '../../field-kits/summary';
import { resolveFieldKit } from '../../field-kits';
import { EnumTagSelect } from '../../field-kits/sub-components/EnumTagSelect';
import { blankFor, moved } from '../behavior/array-elements';
import { isTagsField } from '../behavior/tag-field';
import { TagArrayEditor } from './TagArrayEditor';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';
import type { ArrayFieldEditorProps } from '../RecordEditor.type';
import '../RecordEditor.css';

const UP = '↑';
const DOWN = '↓';
const REMOVE = '×';
const ADD = '+ Add';

/** A closed set with something in it. The chip row serves only that case. */
const closedSetOf = (element: FieldDescriptor): readonly string[] | undefined =>
  element.kind === 'enum' && element.options?.length ? element.options : undefined;

const ArrayFieldEditor = (props: ArrayFieldEditorProps) => {
  const { field, value, binding } = props;
  const element = field.of;
  const kit = element ? resolveFieldKit(element.kind) : undefined;
  if (!element || !kit) return null;
  if (isTagsField(field)) return <TagArrayEditor field={field} value={value} binding={binding} />;

  const list = toList(value);
  const { disabled } = binding;
  const write = (next: readonly unknown[]): void => binding.onChange(field.path, next);
  const ElementControl = kit.EditorControl;
  const closedSet = closedSetOf(element);

  if (closedSet) {
    return (
      <EnumTagSelect
        id={field.path}
        options={closedSet}
        selected={list.map(toText)}
        disabled={disabled}
        onChange={(selected) => write([...selected])}
      />
    );
  }

  return (
    <Flex className="record-editor__array" direction="column" gap="xs">
      {!list.length && <Text className="record-editor__empty">{countLabel(0)}</Text>}
      {list.map((entry, index) => (
        <Flex key={`${field.path}.${index}`} className="record-editor__array-row" gap="xs" align="center">
          <ElementControl
            field={element}
            value={entry}
            disabled={disabled}
            resolveIdRefOptions={binding.resolveIdRefOptions}
            onChange={(next) => write(list.map((held, at) => (at === index ? next : held)))}
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
      ))}
      <Flex justify="start">
        <Button
          size="sm"
          variant="tertiary"
          disabled={disabled}
          onClick={() => write([...list, blankFor(element)])}
        >
          {ADD}
        </Button>
      </Flex>
    </Flex>
  );
};

export { ArrayFieldEditor };
