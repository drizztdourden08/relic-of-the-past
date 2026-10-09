/* @layer renderer-components @kind component */
import { useState, useMemo } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { SPRITE_MANIFEST, CATEGORY_LABELS, CATEGORY_ORDER } from '@shared/game/data';
import { CatButton } from './CatButton';
import { SpriteCard } from './SpriteCard';
import type { CategoryFilter, SpriteGridProps } from './SpriteGrid.type';

const SpriteGrid = (props: SpriteGridProps) => {
  const { baseUrl } = props;
  const [catFilter, setCatFilter] = useState<CategoryFilter>('all');

  const filtered = useMemo(
    () => SPRITE_MANIFEST.filter(s => catFilter === 'all' || s.category === catFilter),
    [catFilter]
  );

  const catCounts = useMemo(() => {
    const cc: Record<string, number> = { all: SPRITE_MANIFEST.length };
    for (const cat of CATEGORY_ORDER) cc[cat] = SPRITE_MANIFEST.filter(s => s.category === cat).length;
    return cc;
  }, []);

  return (
    <Box className="sprite-manager__panel">
      <Box className="sprite-manager__filters">
        <CatButton label="All" value="all" current={catFilter} onClick={setCatFilter} count={catCounts.all} />
        {CATEGORY_ORDER.map(c => (
          <CatButton key={c} label={CATEGORY_LABELS[c]} value={c} current={catFilter} onClick={setCatFilter} count={catCounts[c]} />
        ))}
      </Box>
      <Box className="sprite-manager__grid">
        {filtered.map(sprite => (
          <SpriteCard key={sprite.file} file={sprite.file} label={sprite.label} category={sprite.category} baseUrl={baseUrl} />
        ))}
      </Box>
    </Box>
  );
};

export { SpriteGrid };
