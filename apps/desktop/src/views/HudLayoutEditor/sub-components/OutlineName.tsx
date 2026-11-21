/* @layer renderer-components @kind component */
import { Pressable, Text } from '@drizztdourden08/tessera/primitives';
import type { OutlineNameProps } from './OutlineName.type';
import { useT, useText } from '@drizztdourden08/brock-react';

const OutlineName = (props: OutlineNameProps) => {
  const t = useT();
  const text = useText();
  const { kind, label, cell, locked, missingSlots, selected, onSelect } = props;

  return (
    <Pressable className="hud-outline__name" aria-pressed={selected} onClick={onSelect}>
      <Text className="hud-outline__glyph" aria-hidden>{kind === 'container' ? '▤' : '◦'}</Text>
      <Text className="hud-outline__text">{label}</Text>
      {cell && <Text className="hud-outline__badge">{cell}</Text>}
      {locked && <Text className="hud-outline__badge" title={t('hud-editor:outline-name.title.edit-this-from-the-case')}>{text(locked)}</Text>}
      {missingSlots.length > 0 && (
        <Text className="hud-outline__note" title={t('hud-editor:outline-name.title.out-of-range-for-the')}>
          {t('hud-editor:outline-name.text.slots-out-of-range', { slots: missingSlots.join(', ') })}
        </Text>
      )}
    </Pressable>
  );
};

export { OutlineName };
