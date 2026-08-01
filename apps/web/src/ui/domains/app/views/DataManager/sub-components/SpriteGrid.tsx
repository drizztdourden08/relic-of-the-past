/* @layer renderer-components @kind component */
import { useState, useMemo } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Image } from '../../../../../design-system/primitives/Image';
import { Button } from '../../../../../design-system/primitives/Button';
import {
  SPRITE_MANIFEST,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type SpriteCategory,
} from '@shared/game/data';

interface SpriteGridProps {
  /** Base URL for the selected ROM's extracted sprite PNGs. */
  baseUrl: string;
}

const SpriteGrid = (props: SpriteGridProps) => {
  const { baseUrl } = props;
  const [catFilter, setCatFilter] = useState<'all' | SpriteCategory>('all');

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

const CatButton = (props: { label: string; value: 'all' | SpriteCategory; current: string; onClick: (v: 'all' | SpriteCategory) => void; count: number }) => {
  const { label, value, current, onClick, count } = props;
  return (
    <Button
      variant="bare"
      className={`sprite-manager__cat-btn ${current === value ? 'sprite-manager__cat-btn--active' : ''}`}
      onClick={() => onClick(value)}
    >
      {label} <Text className="sprite-manager__cat-count">{count}</Text>
    </Button>
  );
};

const SpriteCard = (props: { file: string; label: string; category: SpriteCategory; baseUrl: string }) => {
  const { file, label, category, baseUrl } = props;
  return (
    <Box className="sprite-card">
      <Image className="sprite-card__img" src={`${baseUrl}${file}.png`} alt={label} draggable={false} />
      <Box className="sprite-card__info">
        <Text className="sprite-card__label">{label}</Text>
        <Text className="sprite-card__category">{CATEGORY_LABELS[category]}</Text>
      </Box>
    </Box>
  );
};

export { SpriteGrid };
export type { SpriteGridProps };
