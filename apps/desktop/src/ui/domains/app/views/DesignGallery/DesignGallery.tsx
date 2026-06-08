/* @layer renderer-app @kind component */
/**
 * DesignGallery — a custom in-app "storybook". Left sidebar lists stories
 * grouped by Foundations / Components; the canvas renders the selected story
 * (each primitive shown with example usage in the canonical design language).
 * Reachable from the title-bar Advanced menu.
 */
import { useState } from 'react';
import { Box, Text } from '../../../../design-system/primitives';
import { STORIES } from './behavior/gallery-stories';
import { StoryNav } from './sub-components/StoryNav';
import './DesignGallery.css';

const DesignGallery = () => {
  const [activeId, setActiveId] = useState(STORIES[0].id);
  const active = STORIES.find(s => s.id === activeId) ?? STORIES[0];
  const Active = active.Component;

  return (
    <Box className="dg-root">
      <StoryNav stories={STORIES} activeId={activeId} onSelect={setActiveId} />
      <Box className="dg-canvas">
        <Box className="dg-canvas__head">
          <Text className="dg-canvas__group">{active.group}</Text>
          <Text as="h1" className="dg-canvas__title">{active.label}</Text>
        </Box>
        <Active />
      </Box>
    </Box>
  );
};

export { DesignGallery };
