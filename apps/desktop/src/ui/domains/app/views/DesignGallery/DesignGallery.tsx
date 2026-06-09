/* @layer renderer-app @kind component */
/**
 * DesignGallery — a custom in-app "storybook", built FROM the design system:
 * the chrome is the real SettingsShell + SideNav, and every story renders the
 * actual DS primitives/composites with example usage. Reachable from the
 * title-bar Advanced menu.
 */
import { useState, useMemo } from 'react';
import { Box, Text } from '../../../../design-system/primitives';
import { SettingsShell } from '../../../../design-system/composites/SettingsShell';
import { STORIES } from './behavior/gallery-stories';
import './DesignGallery.css';

const DesignGallery = () => {
  const [activeId, setActiveId] = useState(STORIES[0].id);
  const active = STORIES.find(s => s.id === activeId) ?? STORIES[0];
  const Active = active.Component;

  const navGroups = useMemo(() => {
    const titles = [...new Set(STORIES.map(s => s.group))];
    return titles.map(title => ({
      title,
      items: STORIES.filter(s => s.group === title).map(s => ({ id: s.id, label: s.label })),
    }));
  }, []);

  const header = <Text className="dg-brand">Design Language</Text>;

  return (
    <SettingsShell nav={{ groups: navGroups, activeId, onSelect: setActiveId, searchable: true, searchPlaceholder: 'Filter…', header }}>
      <Box className="dg-canvas-head">
        <Text className="dg-canvas-head__group">{active.group}</Text>
        <Text as="h1" className="dg-canvas-head__title">{active.label}</Text>
      </Box>
      <Active />
    </SettingsShell>
  );
};

export { DesignGallery };
