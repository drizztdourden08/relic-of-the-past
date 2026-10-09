/* @layer renderer-components @kind component */
import type { KeyboardEvent } from 'react';
import { Pressable, Text, EmojiIcon } from '@drizztdourden08/tessera/primitives';
import './SlotActionButton.css';
import type { SlotActionButtonProps } from './SlotActionButton.type';

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
    <Pressable
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
    </Pressable>
  );
};

export { SlotActionButton };
