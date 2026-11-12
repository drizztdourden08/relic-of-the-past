/* @layer renderer-app @kind component */
import { Button, Flex, Text } from '@drizztdourden08/tessera/primitives';
import './TouchEditBar.css';
import type { TouchEditBarProps } from './TouchEditBar.type';

const TouchEditBar = (props: TouchEditBarProps) => {
  const { orientation, onAdd, onLayer, onCancel, onDone } = props;
  return (
    <div className="touch-edit-bar" onPointerDown={(event) => event.stopPropagation()}>
      <Text variant="label" className="touch-edit-bar__title">{`Editing ${orientation} layout`}</Text>
      <Flex gap="sm" align="center" className="touch-edit-bar__actions">
        <Button size="sm" variant="secondary" onClick={onAdd}>Add button</Button>
        <Button size="sm" variant="secondary" onClick={onLayer}>Layer</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button size="sm" variant="primary" onClick={onDone}>Done</Button>
      </Flex>
    </div>
  );
};

export { TouchEditBar };
