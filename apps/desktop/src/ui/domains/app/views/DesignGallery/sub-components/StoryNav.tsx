/* @layer renderer-app @kind component */
import { Box, Text } from '../../../../../design-system/primitives';
import type { StoryMeta } from '../behavior/gallery-stories';

/** Left sidebar: stories grouped, the active one highlighted in gold. */
const StoryNav = ({ stories, activeId, onSelect }: { stories: StoryMeta[]; activeId: string; onSelect: (id: string) => void }) => {
  const groups = [...new Set(stories.map(s => s.group))];
  return (
    <Box as="nav" className="dg-nav">
      <Text className="dg-nav__brand">Design Language</Text>
      {groups.map(group => (
        <Box key={group} className="dg-nav__group">
          <Text className="dg-nav__group-title">{group}</Text>
          {stories.filter(s => s.group === group).map(s => (
            <Box
              as="button"
              key={s.id}
              className={`dg-nav__item${s.id === activeId ? ' dg-nav__item--active' : ''}`}
              onClick={() => onSelect(s.id)}
            >
              {s.label}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export { StoryNav };
