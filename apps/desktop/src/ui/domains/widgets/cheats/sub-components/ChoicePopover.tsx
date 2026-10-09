/* @layer renderer-widgets @kind component */
import { useRef } from 'react';
import { Anchored, Box, Image, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { useAnchorRef } from '../behavior/useAnchorRef';
import { useDismiss } from '../behavior/useDismiss';
import type { ChoiceOption, ChoicePopoverProps } from './ChoicePopover.type';

const toneClass = (option: ChoiceOption): string =>
  (option.tone && option.tone !== 'plain' ? ` cheats-popover__row--${option.tone}` : '');

const ChoicePopover = (props: ChoicePopoverProps) => {
  const { title, options, anchor, onClose, allLabel } = props;
  const ref = useRef<HTMLDivElement>(null);
  const anchorRef = useAnchorRef(anchor);
  useDismiss(ref, anchor, onClose);

  return (
    <Anchored ref={ref} anchorRef={anchorRef} placement="bottom-start" layer="popover" className="cheats-popover" role="menu" aria-label={title}>
      <Text className="cheats-popover__title">{title}</Text>
      {options.map((option) => (
        <Pressable
          key={option.key}
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
        </Pressable>
      ))}
    </Anchored>
  );
};

export { ChoicePopover };
