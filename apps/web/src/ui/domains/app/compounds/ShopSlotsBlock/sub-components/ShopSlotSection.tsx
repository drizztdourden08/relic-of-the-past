/* @layer renderer-components @kind component */
/**
 * One world's worth of shop cards, under its own heading, the same titled
 * section every other part of this screen is built from, so the split reads
 * as part of the panel instead of as a device of this block's own.
 *
 * The heading is what lets the cards inside drop the world words from their
 * names: the section has already said which half of the map they stand in.
 */
import { Grid } from '@ds/primitives';
import { RandomizerOptionGroup } from '../../RandomizerOptionGroup';
import { ShopSlotCard } from './ShopSlotCard';
import type { ShopSectionModel } from '../behavior/shop-sections';
import './ShopSlotSection.css';

interface ShopSlotSectionProps {
  section: ShopSectionModel;
  /** Vanilla mode or a read-only render: every card draws inert. */
  disabled: boolean;
  onSlotChange?: (canonicalIndex: number, checked: boolean) => void;
}

const ShopSlotSection = (props: ShopSlotSectionProps) => {
  const { section, disabled, onSlotChange } = props;

  return (
    <RandomizerOptionGroup title={section.title} live className="shop-slot-section">
      <Grid className="shop-slot-section__grid">
        {section.cards.map((card) => (
          <ShopSlotCard
            key={card.id}
            card={card}
            disabled={disabled}
            onSlotChange={onSlotChange}
          />
        ))}
      </Grid>
    </RandomizerOptionGroup>
  );
};

export { ShopSlotSection };
export type { ShopSlotSectionProps };
