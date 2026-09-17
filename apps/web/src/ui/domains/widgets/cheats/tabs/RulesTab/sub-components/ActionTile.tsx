/* @layer renderer-widgets @kind component */
/**
 * One action as a tile: a dashed square that runs its action once when pressed and holds
 * no state. The sprite and a short name are the button's face, the full label its
 * tooltip and accessible name. A tile whose category the profile turns off draws inert,
 * with the reason as its tooltip.
 */
import { Box, Button, Image, Text } from '@ds/primitives';
import { spriteUrlOf } from '@shared/game/logic/queries/item-sprites';
import type { ActionTileSpec } from '../RulesTab.type';

type ActionTileProps = {
  spec: ActionTileSpec;
  /** The category is off: the tile draws inert and this sentence is its tooltip. */
  reason?: string;
};

const PLACEHOLDER = <Box className="cheats-rules__sprite cheats-rules__sprite--placeholder" />;

const ActionTile = (props: ActionTileProps) => {
  const { spec, reason } = props;
  const { label, name, sprite, run } = spec;
  const disabled = reason !== undefined;
  const title = reason ?? label;

  return (
    <Button
      variant="bare"
      className="cheats-action"
      data-state={disabled ? 'disabled' : 'off'}
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={run}
    >
      <Image className="cheats-rules__sprite" src={spriteUrlOf(sprite)} alt="" draggable={false} fallback={PLACEHOLDER} />
      <Text className="cheats-rules__name">{name}</Text>
    </Button>
  );
};

export { ActionTile };
export type { ActionTileProps };
