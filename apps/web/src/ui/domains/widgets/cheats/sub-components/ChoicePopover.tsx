/* @layer renderer-widgets @kind component */
/**
 * The list a slot opens: one row per choice with its sprite, the current one marked, and an
 * optional "all" control on each row for a rack of identical slots (the four bottles).
 * Portalled and placed under its anchor in viewport coordinates, so the widget's own edges
 * never cut it.
 */
import { useRef } from 'react';
import { Box, Button, Image, Portal, Text } from '@ds/primitives';
import { useAnchoredPlacement } from '../behavior/useAnchoredPlacement';
import { useDismiss } from '../behavior/useDismiss';
import type { ChoiceOption, ChoicePopoverProps } from './ChoicePopover.type';

const toneClass = (option: ChoiceOption): string =>
  (option.tone && option.tone !== 'plain' ? ` cheats-popover__row--${option.tone}` : '');

const ChoicePopover = (props: ChoicePopoverProps) => {
  const { title, options, anchor, onClose, allLabel } = props;
  const ref = useRef<HTMLDivElement>(null);
  const { left, top, placed } = useAnchoredPlacement(ref, anchor, options.length);
  useDismiss(ref, anchor, onClose);

  return (
    <Portal layer="popover">
      <Box ref={ref} className="cheats-popover" role="menu" aria-label={title} style={{ left, top }} data-placed={placed ? '' : undefined}>
        <Text className="cheats-popover__title">{title}</Text>
        {options.map((option) => (
          <Button
            key={option.key}
            variant="bare"
            role="menuitem"
            className={`cheats-popover__row${toneClass(option)}`}
            data-current={option.current ? '' : undefined}
            title={option.hint}
            onClick={() => { option.onPick(); onClose(); }}
          >
            {option.sprite
              ? <Image className="cheats-popover__sprite" src={option.sprite} alt="" draggable={false} />
              : <Box className="cheats-popover__sprite cheats-popover__sprite--none" />}
            <Text className="cheats-popover__label">{option.label}</Text>
            {option.current && <Text className="cheats-popover__current">current</Text>}
            {option.onPickAll && allLabel && (
              <Text
                as="span"
                role="button"
                className="cheats-popover__all"
                title={option.allHint}
                onClick={(e) => { e.stopPropagation(); option.onPickAll?.(); onClose(); }}
              >
                {allLabel}
              </Text>
            )}
          </Button>
        ))}
      </Box>
    </Portal>
  );
};

export { ChoicePopover };
