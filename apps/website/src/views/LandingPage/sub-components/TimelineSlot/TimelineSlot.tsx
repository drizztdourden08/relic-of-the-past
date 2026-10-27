/* @layer website-site @kind component */
import { Box, Link, List, ListItem } from '../../../../design';
import type { TimelineSlotProps } from './TimelineSlot.type';
import './TimelineSlot.css';

const TimelineSlot = ({ entries, activeId, ariaLabel, onJump }: TimelineSlotProps) => (
  <Box as="nav" aria-label={ariaLabel} className="timeline-slot" data-idle={activeId === null || undefined}>
    <List ordered>
      {entries.map((group) => (
        <ListItem key={group.id}>
          <Link href={`#${group.id}`} aria-current={group.id === activeId ? 'location' : undefined} onClick={() => onJump(group.id)}>
            {group.label}
          </Link>
          <List ordered>
            {group.children?.map((item) => (
              <ListItem key={item.id}>
                <Link href={`#${item.id}`} aria-current={item.id === activeId ? 'location' : undefined} onClick={() => onJump(item.id)}>
                  {item.label}
                </Link>
              </ListItem>
            ))}
          </List>
        </ListItem>
      ))}
    </List>
  </Box>
);

export { TimelineSlot };
