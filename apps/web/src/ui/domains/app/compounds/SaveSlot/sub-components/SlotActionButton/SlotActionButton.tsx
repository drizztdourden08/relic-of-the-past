/* @layer renderer-components @kind component */
import type { KeyboardEvent } from 'react';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { EmojiIcon } from '../../../../../../design-system/primitives/EmojiIcon';
import './SlotActionButton.css';
import type { SlotActionButtonProps } from './SlotActionButton.type';

/** One half of a slot's action bar. Reads as armed after the first click. */
const SlotActionButton = (props: SlotActionButtonProps) => {
  const { action, glyph, label, shortcutHint, disabled, armed, onPress, onDisarm } = props;

  const armedLabel = `${label}: armed, click again to confirm`;
  const idleTitle = shortcutHint ? `${label} (${shortcutHint})` : label;
  const className = [
    'slot-action',
    `slot-action--${action}`,
    armed ? 'slot-action--armed' : '',
  ].filter(Boolean).join(' ');

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') onDisarm();
  };

  return (
    <Button
      variant="bare"
      className={className}
      onClick={onPress}
      onBlur={onDisarm}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      title={armed ? armedLabel : idleTitle}
      aria-label={armed ? armedLabel : label}
      aria-pressed={armed}
    >
      <Text className="slot-action__glyph">
        <EmojiIcon glyph={glyph} size="lg" className="slot-action__emoji" />
      </Text>
    </Button>
  );
};

export { SlotActionButton };
