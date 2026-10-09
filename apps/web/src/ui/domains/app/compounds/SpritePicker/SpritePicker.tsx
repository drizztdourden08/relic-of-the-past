/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Anchored, Box, EmptyState, Image, Pressable, Tabs, Text } from '@drizztdourden08/tessera/primitives';
import { usePickerDismiss } from './behavior/usePickerDismiss';
import './SpritePicker.css';
import type { SpritePickerProps } from './SpritePicker.type';

const SpritePicker = (props: SpritePickerProps) => {
  const { open, anchorRef, sprites, categories, categoryLabels, spriteUrl, onPick, onClose, notice } = props;
  const present = categories.filter((category) => sprites.some((sprite) => sprite.category === category));
  const [category, setCategory] = useState(present[0] ?? '');
  const panelRef = useRef<HTMLDivElement>(null);
  usePickerDismiss({ open, anchorRef, panelRef, onClose });

  if (!open) return null;

  const activeCategory = present.includes(category) ? category : present[0];
  const tiles = sprites.filter((sprite) => sprite.category === activeCategory);

  return (
    <Anchored ref={panelRef} anchorRef={anchorRef} placement="bottom-start" layer="popover" className="sprite-picker">
      {present.length === 0 ? (
        <EmptyState message="No sprite definitions in this checkout." />
      ) : (
        <>
          {notice}
          <Box className="sprite-picker__tabs">
            <Tabs
              tabs={present.map((id) => ({ id, label: categoryLabels[id] ?? id }))}
              activeTab={activeCategory}
              onTabChange={setCategory}
            />
          </Box>
          <Box className="sprite-picker__tiles">
            {tiles.map((sprite) => (
              <Pressable
                key={sprite.file}
                className="sprite-picker__tile"
                title={sprite.label}
                onClick={() => { onPick(sprite.file); onClose(); }}
              >
                <Image frame src={spriteUrl(sprite.file)} alt={sprite.label} fallback="?" className="sprite-picker__thumb" />
                <Text className="sprite-picker__label">{sprite.label}</Text>
              </Pressable>
            ))}
          </Box>
        </>
      )}
    </Anchored>
  );
};

export { SpritePicker };
