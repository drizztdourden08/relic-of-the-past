/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { OutlineHintProps } from './OutlineHint.type';
import { useT } from '@drizztdourden08/brock-react';

const OutlineHint = (props: OutlineHintProps) => {
  const t = useT();
  const { modifier } = props;

  return (
    <Text className="hud-editor__hint">
      {t('hud-editor:outline-hint.text.drag', { modifier })}
    </Text>
  );
};

export { OutlineHint };
