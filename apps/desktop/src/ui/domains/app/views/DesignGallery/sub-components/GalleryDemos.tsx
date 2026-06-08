/* @layer renderer-app @kind component */
import { useState } from 'react';
import { Box, Text } from '../../../../../design-system/primitives';
import './GalleryDemos.css';

const TABS = ['Items', 'Abilities', 'Equipment'];
const CHIPS = ['door', 'passage', 'hole', 'ledge', 'staircase'];

/** Live specimens demonstrating the gold(primary)/green(secondary) control rules. */
const GalleryDemos = () => {
  const [tab, setTab] = useState(0);
  const [chips, setChips] = useState<Set<string>>(new Set(['door', 'ledge']));
  const toggleChip = (c: string) => setChips(prev => {
    const next = new Set(prev); next.has(c) ? next.delete(c) : next.add(c); return next;
  });

  return (
    <Box className="dg-demos">
      {/* Buttons */}
      <Box className="dg-demo-row">
        <Box as="button" className="dg-btn dg-btn--primary">Primary (gold)</Box>
        <Box as="button" className="dg-btn">Secondary</Box>
        <Box as="button" className="dg-btn dg-btn--ghost">Ghost</Box>
        <Box as="button" className="dg-btn dg-btn--positive">Start ▸ (green)</Box>
        <Box as="button" className="dg-btn dg-btn--danger">Delete</Box>
        <Box as="button" className="dg-btn" disabled>Disabled</Box>
      </Box>
      <Text className="dg-note">Gold = the primary action &amp; emphasis. Green = positive/go only (Start, Connect, Resume).</Text>

      {/* Tabs — selection is gold */}
      <Box className="dg-tabs">
        {TABS.map((t, i) => (
          <Box as="button" key={t} className={`dg-tab${i === tab ? ' dg-tab--active' : ''}`} onClick={() => setTab(i)}>{t}</Box>
        ))}
      </Box>

      {/* Selectable chips — selection is gold */}
      <Box className="dg-demo-row">
        {CHIPS.map(c => (
          <Box as="button" key={c} className={`dg-chip${chips.has(c) ? ' dg-chip--active' : ''}`} onClick={() => toggleChip(c)}>{c}</Box>
        ))}
      </Box>

      {/* Status — green = positive, amber = pending, red = blocked, blue = info */}
      <Box className="dg-demo-row dg-demo-row--status">
        <Text className="dg-status dg-status--ok">● complete</Text>
        <Text className="dg-status dg-status--pending">● reachable</Text>
        <Text className="dg-status dg-status--blocked">● blocked</Text>
        <Text className="dg-status dg-status--info">● info</Text>
      </Box>

      {/* Containers */}
      <Box className="dg-demo-row dg-demo-row--cards">
        <Box className="dg-card">
          <Text className="dg-card__title">Card</Text>
          <Text className="dg-card__body">surface · border · radius-lg</Text>
        </Box>
        <Box className="dg-card dg-card--selected">
          <Text className="dg-card__title">Selected card</Text>
          <Text className="dg-card__body">gold border + gold-soft fill</Text>
        </Box>
        <Box className="dg-glass">
          <Text className="dg-card__title">Glass panel</Text>
          <Text className="dg-card__body">glass surface + one blur (over game)</Text>
        </Box>
      </Box>
    </Box>
  );
};

export { GalleryDemos };
