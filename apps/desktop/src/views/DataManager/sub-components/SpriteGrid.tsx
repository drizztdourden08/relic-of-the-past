/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useState, useMemo } from 'react';
import { Box, Tabs } from '@drizztdourden08/tessera/primitives';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import { SPRITE_MANIFEST, CATEGORY_LABELS, CATEGORY_ORDER } from '@rotp/game-data';
import { SpriteCard } from './SpriteCard';
import type { CategoryFilter, SpriteGridProps } from './SpriteGrid.type';

const countOf = (cat: CategoryFilter): number => SPRITE_MANIFEST.filter((s) => cat === 'all' || s.category === cat).length;

const SpriteGrid = (props: SpriteGridProps) => {
  const { baseUrl } = props;
  const t = useT();
  const [catFilter, setCatFilter] = useState<CategoryFilter>('all');

  const filtered = useMemo(
    () => SPRITE_MANIFEST.filter(s => catFilter === 'all' || s.category === catFilter),
    [catFilter]
  );

  const tabs = useMemo((): TabItem[] => [
    { id: 'all', label: t('data-manager:sprite-manager.all'), badge: countOf('all') },
    ...CATEGORY_ORDER.map((c) => ({ id: c, label: CATEGORY_LABELS[c], badge: countOf(c) })),
  ], [t]);

  return (
    <Box className="sprite-manager__panel">
      <Tabs tabs={tabs} activeTab={catFilter} onTabChange={(id) => setCatFilter(id as CategoryFilter)} />
      <Box className="sprite-manager__grid">
        {filtered.map(sprite => (
          <SpriteCard key={sprite.file} file={sprite.file} label={sprite.label} category={sprite.category} baseUrl={baseUrl} />
        ))}
      </Box>
    </Box>
  );
};

export { SpriteGrid };
