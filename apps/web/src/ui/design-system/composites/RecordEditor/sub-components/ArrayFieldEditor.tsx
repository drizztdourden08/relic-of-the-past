/* @layer renderer-components @kind component */
/**
 * Add, remove and reorder for a list whose ELEMENTS are single values.
 *
 * That restriction is the whole scope decision, and it is deliberate. A list of
 * single values has a complete editor in a handful of controls: the element kit
 * already knows how to edit one, and every structural operation is one immutable
 * rewrite of the array. A list of nested records does not — it needs an element
 * form, identity that survives reordering, and an "add what exactly" answer for
 * a variant element — so those stay on the read-only summary the element kit
 * already renders, which is honest, rather than a form that half works.
 *
 * Every operation writes the WHOLE array through the field's own path, so the
 * record is rebuilt by `setPath` exactly as any other edit is.
 *
 * Two element kinds opt out of the rows entirely. A list drawn from a closed
 * set is a SELECTION, not a sequence: every row would offer the same dropdown,
 * order carries no meaning, and "add" cannot say which value it is adding. That
 * reads far better as one chip row where the whole set is visible and picking
 * is the edit. A list of TAGS is the same argument with an open set behind it,
 * so it goes to the tag entry instead. Every other element kind keeps the rows,
 * where order and free values both matter.
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

/** A closed set with something in it — the one case the chip row can serve. */
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
