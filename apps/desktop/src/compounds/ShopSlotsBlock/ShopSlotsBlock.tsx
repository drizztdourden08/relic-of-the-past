/* @layer renderer-components @kind component */
import { Box, Select, Slider, Text } from '@drizztdourden08/tessera/primitives';
import { OptionValueTag, choiceLabelOf } from '../OptionValueTag';
import { RandomizerOptionGroup } from '../RandomizerOptionGroup';
import { ShopSlotCount } from './sub-components/ShopSlotCount';
import { ShopSlotSection } from './sub-components/ShopSlotSection';
import { shopSectionsOf } from './behavior/shop-sections';
import { shopTotalTextOf } from './behavior/shop-total-text';
import { retroShopNoteOf } from './behavior/retro-shop-note';
import { summaryOf } from './behavior/summary-of';
import { withDepth } from './behavior/with-depth';
import { withMode } from './behavior/with-mode';
import { withSlotCount } from './behavior/with-slot-count';
import { withSlotTicked } from './behavior/with-slot-ticked';
import { DEPTH_LABEL, MODE_OPTIONS, MODE_TITLE, SLOTS_TITLE } from './ShopSlotsBlock.constants';
import { MAX_SHOP_SLOT_DEPTH, MIN_SHOP_SLOT_DEPTH } from '@rotp/randomizer';
import type { ShopShuffleMode } from '@rotp/randomizer';
import type { ShopSlotsBlockProps } from './ShopSlotsBlock.type';
import './ShopSlotsBlock.css';

const ShopSlotsBlock = (props: ShopSlotsBlockProps) => {
  const { scope, retroBow, onChange } = props;
  const summary = summaryOf(scope);
  const readOnly = onChange === undefined;
  const inert = readOnly || !summary.active;
  const sections = shopSectionsOf(scope);
  const retroNote = retroShopNoteOf(scope, retroBow);

  return (
    <Box className="shop-slots-block">
      <RandomizerOptionGroup title={MODE_TITLE} live className="shop-slots-block__mode">
        <Box className="shop-slots-block__mode-control">
          {readOnly ? <OptionValueTag value={choiceLabelOf(MODE_OPTIONS, scope.mode)} /> : (
            <Select
              value={scope.mode}
              options={MODE_OPTIONS}
              onChange={(next) => onChange(withMode(scope, next as ShopShuffleMode))}
            />
          )}
        </Box>
        {retroNote !== null && <Text className="shop-slots-block__note">{retroNote}</Text>}
      </RandomizerOptionGroup>

      <RandomizerOptionGroup title={SLOTS_TITLE} live className="shop-slots-block__slots">
        {sections.map((section) => (
          <ShopSlotSection
            key={section.world}
            section={section}
            disabled={inert}
            readout={readOnly}
            onSlotChange={readOnly ? undefined
              : (index, next) => onChange(withSlotTicked(scope, index, next))}
          />
        ))}
      </RandomizerOptionGroup>

      <Box className="shop-slots-block__controls">
        <ShopSlotCount
          summary={summary}
          disabled={inert}
          readout={readOnly}
          onChange={readOnly ? undefined : (next) => onChange(withSlotCount(scope, next))}
        />
        {readOnly ? <OptionValueTag label={DEPTH_LABEL} value={summary.depth} /> : (
          <Slider
            label={DEPTH_LABEL}
            value={summary.depth}
            min={MIN_SHOP_SLOT_DEPTH}
            max={MAX_SHOP_SLOT_DEPTH}
            disabled={inert}
            onChange={(next) => onChange(withDepth(scope, next))}
          />
        )}
        <Text className="shop-slots-block__total">{shopTotalTextOf(summary)}</Text>
      </Box>
    </Box>
  );
};

export { ShopSlotsBlock };
