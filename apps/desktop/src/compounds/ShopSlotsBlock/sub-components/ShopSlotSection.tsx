/* @layer renderer-components @kind component */
import { Grid } from '@drizztdourden08/tessera/primitives';
import { OptionGroup } from '@drizztdourden08/tessera/composites';
import { ShopSlotCard } from './ShopSlotCard';
import type { ShopSlotSectionProps } from '../ShopSlotsBlock.type';
import './ShopSlotSection.css';

const ShopSlotSection = (props: ShopSlotSectionProps) => {
  const { section, disabled, readout, onSlotChange } = props;

  return (
    <OptionGroup title={section.title} tone="live" className="shop-slot-section">
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
    </OptionGroup>
  );
};

export { ShopSlotSection };
