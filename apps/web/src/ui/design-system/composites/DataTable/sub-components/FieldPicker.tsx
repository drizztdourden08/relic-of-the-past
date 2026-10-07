/* @layer renderer-components @kind component */
/**
 * The recursive field tree. No table state and no positioning policy: it
 * renders a bare list and whoever opens it decides where it floats, so it
 * serves both "add a column" and "add a filter".
 */
import { useMemo } from 'react';
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import { buildPickerNodes } from '../behavior/field-picker-nodes';
import { FieldPickerNode } from './FieldPickerNode';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';
import '../../DropdownMenu/DropdownMenu.css';
import './FieldPicker.css';

interface FieldPickerProps {
  schema: readonly FieldDescriptor[];
  onPick: (path: string) => void;
  /** Fields already in use, such as a column already shown or a field already filtered. */
  excludePaths?: readonly string[];
  emptyMessage?: string;
}

const FieldPicker = (props: FieldPickerProps) => {
  const { schema, onPick, excludePaths, emptyMessage = 'No fields left to add' } = props;
  const nodes = useMemo(() => buildPickerNodes(schema, excludePaths), [schema, excludePaths]);

  return (
    <Box className="field-picker" role="menu">
      {nodes.length === 0 && <Text className="field-picker__empty">{emptyMessage}</Text>}
      {nodes.map((node) => (
        <FieldPickerNode key={node.path} node={node} onPick={onPick} />
      ))}
    </Box>
  );
};

export { FieldPicker };
export type { FieldPickerProps };
