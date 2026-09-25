/* @layer renderer-components @kind component */
/**
 * A sprite, picked by eye: a category strip over a grid of tiles, each the
 * actual art above its own label. As a composite it takes props and owns no
 * store, so anything that needs "pick a sprite by eye" gets it for free
 * without reaching into the HUD layout editor.
 *
 * Every tile always gets a real `src`; there is no bulk gate that blanks the
 * whole grid when extraction is incomplete. `Thumbnail` falls back to its own
 * placeholder per tile on a 404, so a partially-extracted set shows what
 * exists instead of 40 question marks. `notice` is where a caller surfaces
 * "some sprites still need extracting". This component has no opinion on
 * that; it just reserves the slot.
 */
import { useState } from 'react';
import { Portal, usePickerPopover } from '@ds/primitives/Portal';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { TabBar } from '@ds/primitives/TabBar';
import { Thumbnail } from '@ds/primitives/Thumbnail';
import { EmptyState } from '@ds/primitives/EmptyState';
import './SpritePicker.css';
import type { SpritePickerProps } from './SpritePicker.type';

const SpritePicker = (props: SpritePickerProps) => {
  const { open, anchorRef, sprites, categories, categoryLabels, spriteUrl, onPick, onClose, notice } = props;
  const present = categories.filter((category) => sprites.some((sprite) => sprite.category === category));
  const [category, setCategory] = useState(present[0] ?? '');
  const { position, panelRef } = usePickerPopover({ open, anchorRef, onClose, estimatedWidth: 300, estimatedHeight: 320 });

  if (!open) return null;

  const activeCategory = present.includes(category) ? category : present[0];
  const tiles = sprites.filter((sprite) => sprite.category === activeCategory);

  return (
    <Portal layer="popover">
      <Box
        ref={panelRef}
        className="sprite-picker"
        data-drop-up={position?.dropUp ? 'true' : undefined}
        style={position ? { top: position.top, left: position.left } : undefined}
      >
        {present.length === 0 ? (
          <EmptyState message="No sprite definitions in this checkout." />
        ) : (
          <>
            {notice}
            <Box className="sprite-picker__tabs">
              <TabBar
                tabs={present.map((id) => ({ id, label: categoryLabels[id] ?? id }))}
                activeTab={activeCategory}
                onTabChange={setCategory}
              />
            </Box>
            <Box className="sprite-picker__tiles">
              {tiles.map((sprite) => (
                <Button
                  variant="bare"
                  key={sprite.file}
                  className="sprite-picker__tile"
                  title={sprite.label}
                  onClick={() => { onPick(sprite.file); onClose(); }}
                >
                  <Thumbnail
                    src={spriteUrl(sprite.file)}
                    alt={sprite.label}
                    placeholder="?"
                    className="sprite-picker__thumb"
                  />
                  <Text className="sprite-picker__label">{sprite.label}</Text>
                </Button>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Portal>
  );
};

export { SpritePicker };
