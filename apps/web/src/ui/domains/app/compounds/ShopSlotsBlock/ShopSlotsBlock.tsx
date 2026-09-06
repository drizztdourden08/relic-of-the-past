/* @layer renderer-components @kind component */
/**
 * The shop-scope section of an options panel, and everything the Shops tab
 * shows above the prices.
 *
 * The order is the decision order, and it starts with the mode because the
 * mode governs the rest: on vanilla nothing else on the tab can change the
 * seed, so every control under it (the cards, both sliders, the prices block
 * beyond this component) draws inert. Then the cards, split into the two
 * halves of the map and one per shop, because the ticks are what every mode
 * draws from; then the count, whose MAXIMUM is the size of the ticked set
 * rather than a number typed here, so the control can never offer a slot that
 * does not exist; then the depth and what the two of them cost the seed.
 *
 * The count control and the total sentence read the SAME number off the
 * summary (the slots this scope really opens), so they can never disagree,
 * and a mode that ignores the stored count (custom opens exactly what is
 * ticked) still shows the count it is really running. That mode gets a
 * read-out rather than a slider, because a track whose value is its own
 * maximum can only ever draw full (sub-components/ShopSlotCount).
 *
 * Shared by the creation panel and the frozen Run tab; no handler renders the
 * whole section read-only.
 */
import { Box, Select, Slider, Text } from '@ds/primitives';
import { RandomizerOptionGroup } from '../RandomizerOptionGroup';
import { ShopSlotCount } from './sub-components/ShopSlotCount';
import { ShopSlotSection } from './sub-components/ShopSlotSection';
import { shopSectionsOf } from './behavior/shop-sections';
import { shopTotalTextOf } from './behavior/shop-total-text';
import { retroShopNoteOf } from './behavior/retro-shop-note';
import { summaryOf, withDepth, withMode, withSlotCount, withSlotTicked } from './behavior/shop-scope-edits';
import { DEPTH_LABEL, MODE_OPTIONS, MODE_TITLE, SLOTS_TITLE } from './ShopSlotsBlock.constants';
import { MAX_SHOP_SLOT_DEPTH, MIN_SHOP_SLOT_DEPTH } from '@shared/randomizer/ap-world/shops/shop-slots';
import type { RetroBowSetting } from '@shared/randomizer/ap-world/retro/retro.type';
import type { ShopScope, ShopShuffleMode } from '@shared/randomizer/ap-world/shops/shop-scope.type';
import './ShopSlotsBlock.css';

interface ShopSlotsBlockProps {
  scope: ShopScope;
  /** The Items tab's retro switch; on, the mode line says what the arrow shelves sell. */
  retroBow?: RetroBowSetting;
  /** Absent renders the section frozen, the Run tab's read-only view. */
  onChange?: (next: ShopScope) => void;
}

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
          <Select
            value={scope.mode}
            options={MODE_OPTIONS}
            disabled={readOnly}
            onChange={(next) => onChange?.(withMode(scope, next as ShopShuffleMode))}
          />
        </Box>
        {retroNote !== null && <Text className="shop-slots-block__note">{retroNote}</Text>}
      </RandomizerOptionGroup>

      <RandomizerOptionGroup title={SLOTS_TITLE} live className="shop-slots-block__slots">
        {sections.map((section) => (
          <ShopSlotSection
            key={section.world}
            section={section}
            disabled={inert}
            onSlotChange={readOnly ? undefined
              : (index, next) => onChange(withSlotTicked(scope, index, next))}
          />
        ))}
      </RandomizerOptionGroup>

      <Box className="shop-slots-block__controls">
        <ShopSlotCount
          summary={summary}
          disabled={inert}
          onChange={readOnly ? undefined : (next) => onChange(withSlotCount(scope, next))}
        />
        <Slider
          label={DEPTH_LABEL}
          value={summary.depth}
          min={MIN_SHOP_SLOT_DEPTH}
          max={MAX_SHOP_SLOT_DEPTH}
          disabled={inert}
          onChange={(next) => onChange?.(withDepth(scope, next))}
        />
        <Text className="shop-slots-block__total">{shopTotalTextOf(summary)}</Text>
      </Box>
    </Box>
  );
};

export { ShopSlotsBlock };
export type { ShopSlotsBlockProps };
