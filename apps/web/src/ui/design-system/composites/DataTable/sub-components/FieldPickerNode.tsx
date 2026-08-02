/* @layer renderer-components @kind component */
/**
 * One row of the add-column tree, recursing into itself. A leaf is a button; a
 * branch is a hover target that opens its own panel of children, which are
 * again `FieldPickerNode`s — so nesting has no depth limit here, and the
 * schema's own recursion cap is what makes it terminate.
 */
import { useRef, useState } from 'react';
import { Box } from '../../../primitives/Box';
import { Button } from '../../../primitives/Button';
import { Text } from '../../../primitives/Text';
import { SUB_PANEL_WIDTH } from './FieldPicker.constants';
import type { PickerNode } from '../behavior/field-picker-nodes';
import './FieldPicker.css';

interface FieldPickerNodeProps {
  node: PickerNode;
  onPick: (path: string) => void;
}

interface PanelPosition {
  top: number;
  left: number;
}

const FieldPickerNode = (props: FieldPickerNodeProps) => {
  const { node, onPick } = props;
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<PanelPosition | null>(null);

  const handleEnter = (): void => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const overflows = rect.right + SUB_PANEL_WIDTH > window.innerWidth;
    setPosition({ top: rect.top, left: overflows ? rect.left - SUB_PANEL_WIDTH : rect.right });
  };

  if (node.pickable) {
    return (
      <Button variant="bare" className="dropdown__item" onClick={() => onPick(node.path)}>
        <Text className="dropdown__label">{node.label}</Text>
        <Text className="field-picker__kind">{node.kind}</Text>
      </Button>
    );
  }

  return (
    <Box
      ref={ref}
      className="dropdown__submenu-trigger"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setPosition(null)}
    >
      <Box className="dropdown__item dropdown__item--parent">
        <Text className="dropdown__label">{node.label}</Text>
        <Text className="dropdown__chevron">›</Text>
      </Box>
      {position && (
        <Box
          className="dropdown-menu dropdown-menu--sub field-picker"
          style={{ position: 'fixed', top: position.top, left: position.left }}
        >
          {node.children.map((child) => (
            <FieldPickerNode key={child.path} node={child} onPick={onPick} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export { FieldPickerNode };
export type { FieldPickerNodeProps };
