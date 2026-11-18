/* @layer renderer-components @kind component */
import { Button, Flex } from '@drizztdourden08/tessera/primitives';
import { canRemoveKey, removeKey } from '@app/hud-layout-editing/keyframe-track';
import type { KeyToolsProps } from './KeyTools.type';
import { useT } from '@drizztdourden08/brock-react';

const KeyTools = (props: KeyToolsProps) => {
  const t = useT();
  const { keyframes, selected, at, onAdd, onChange, onSelect } = props;

  return (
    <Flex gap="2xs" align="center">
      <Button variant="ghost" size="sm" onClick={() => onAdd(at < 0.5 ? at + 0.25 : at - 0.25)}>
        {t('hud-editor:key-tools.text.key')}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={!canRemoveKey(keyframes)}
        onClick={() => { onChange(removeKey(keyframes, selected)); onSelect(0); }}
      >
        {t('hud-editor:key-tools.text.remove-key')}
      </Button>
    </Flex>
  );
};

export { KeyTools };
