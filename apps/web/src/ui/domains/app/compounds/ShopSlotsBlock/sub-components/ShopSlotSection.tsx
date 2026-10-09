/* @layer renderer-components @kind component */
import { Grid } from '@ds/primitives';
import { RandomizerOptionGroup } from '../../RandomizerOptionGroup';
import { ShopSlotCard } from './ShopSlotCard';
import type { ShopSlotSectionProps } from '../ShopSlotsBlock.type';
import './ShopSlotSection.css';

const ShopSlotSection = (props: ShopSlotSectionProps) => {
  const { section, disabled, readout, onSlotChange } = props;

  return (
    <RandomizerOptionGroup title={section.title} live className="shop-slot-section">
      <Grid className="shop-slot-section__grid">
        {section.cards.map((card) => (
          <ShopSlotCard
            key={card.id}
            card={card}
            disabled={disabled}
            readout={readout}
            onSlotChange={onSlotChange}
          />
        ))}
      </Grid>
    </RandomizerOptionGroup>
  );
};

export { ShopSlotSection };
export type { ShopSlotSectionProps };
