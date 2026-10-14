/* @layer renderer-components @kind component */
import { Button, Flex } from '@drizztdourden08/tessera/primitives';
import { canRemoveKey, removeKey } from '@app/hud-layout-editing/keyframe-track';
import type { KeyToolsProps } from './KeyTools.type';

const KeyTools = (props: KeyToolsProps) => {
  const { keyframes, selected, at, onAdd, onChange, onSelect } = props;

  return (
    <Flex gap="2xs" align="center">
      <Button variant="ghost" size="sm" onClick={() => onAdd(at < 0.5 ? at + 0.25 : at - 0.25)}>
        + key
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={!canRemoveKey(keyframes)}
        onClick={() => { onChange(removeKey(keyframes, selected)); onSelect(0); }}
      >
        remove key
      </Button>
    </Flex>
  );
};

export { KeyTools };
