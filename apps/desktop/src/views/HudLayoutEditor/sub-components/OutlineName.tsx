/* @layer renderer-components @kind component */
import { Pressable, Text } from '@drizztdourden08/tessera/primitives';
import type { OutlineNameProps } from './OutlineName.type';

const OutlineName = (props: OutlineNameProps) => {
  const { kind, label, cell, locked, missingSlots, selected, onSelect } = props;

  return (
    <Pressable className="hud-outline__name" aria-pressed={selected} onClick={onSelect}>
      <Text className="hud-outline__glyph" aria-hidden>{kind === 'container' ? '▤' : '◦'}</Text>
      <Text className="hud-outline__text">{label}</Text>
      {cell && <Text className="hud-outline__badge">{cell}</Text>}
      {locked && <Text className="hud-outline__badge" title="Edit this from the case list or the repeat's Content section.">{locked}</Text>}
      {missingSlots.length > 0 && (
        <Text className="hud-outline__note" title="Out of range for the scheme you are previewing. It still draws, just empty.">
          slot {missingSlots.join(', ')} out of range
        </Text>
      )}
    </Pressable>
  );
};

export { OutlineName };
