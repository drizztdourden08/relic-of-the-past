/* @layer renderer-widgets @kind component */
import { Image, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { spriteUrlOf } from '@rotp/game-data';
import { SpritePlaceholder } from './SpritePlaceholder';
import type { ActionTileProps } from '../RulesTab.type';

const ActionTile = (props: ActionTileProps) => {
  const { spec, reason } = props;
  const { label, name, sprite, run } = spec;
  const disabled = reason !== undefined;
  const title = reason ?? label;

  return (
    <Pressable
      className="cheats-action"
      data-state={disabled ? 'disabled' : 'off'}
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={run}
    >
      <Image className="cheats-rules__sprite" src={spriteUrlOf(sprite)} alt="" draggable={false} fallback={<SpritePlaceholder />} />
      <Text className="cheats-rules__name">{name}</Text>
    </Pressable>
  );
};

export { ActionTile };
