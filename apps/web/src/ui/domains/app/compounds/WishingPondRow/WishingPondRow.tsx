/* @layer renderer-components @kind component */
/**
 * The rupee pond in the options panel: the head line naming the mode the
 * player picked (the dropdown itself sits with their other choices, under its
 * own section), the controls the mode asks for, and the price schedule as a
 * preview in every mode. Bare: the
 * model arrives derived, edits leave as a row state. Reuses the same range,
 * slider, curve and jump-chip controls the capacity families use, so the two
 * sections read and behave identically.
 */
import { Box, Slider, Text } from '@ds/primitives';
import { LadderPreview } from '../LadderPreview';
import { OptionDescription } from '../OptionDescription';
import { PondPriceControls } from './sub-components/PondPriceControls';
import type { PondRowState, WishingPondRowProps } from './WishingPondRow.type';
import './WishingPondRow.css';

const itemsLabel = (count: number): string =>
  (count === 0 ? 'none, not a check' : `${count} item${count === 1 ? '' : 's'}`);

const WishingPondRow = (props: WishingPondRowProps) => {
  const { model, readOnly = false, onChange } = props;
  const { label, modeLabel, caption, state, preview, offersItems, hasPrices, maxItems, walletNote } = model;

  const patch = (part: Partial<PondRowState>) => onChange?.({ ...state, ...part });

  return (
    <Box className="pond-row">
      <Box className="pond-row__head">
        <Text className="pond-row__label">{label}</Text>
        <Text className="pond-row__mode">{modeLabel}</Text>
      </Box>
      {caption !== undefined && <OptionDescription className="pond-row__note" description={caption} />}
      {offersItems && (
        <Box className="pond-row__custom">
          {hasPrices && <PondPriceControls model={model} readOnly={readOnly} onChange={patch} />}
          <Box className="pond-row__items">
            <Text className="pond-row__caption">pool items in the pond</Text>
            <Slider
              value={Math.min(state.items, maxItems)}
              min={0}
              max={maxItems}
              step={1}
              disabled={readOnly}
              formatValue={itemsLabel}
              onChange={(items) => patch({ items })}
            />
          </Box>
        </Box>
      )}
      <Box className="pond-row__preview">
        <Text className="pond-row__preview-title">throw prices</Text>
        <LadderPreview {...preview} />
      </Box>
      {walletNote !== undefined && <Text className="pond-row__footnote">{walletNote}</Text>}
    </Box>
  );
};

export { WishingPondRow };
