/* @layer renderer-components @kind component */
import { Box, Slider, Text } from '@drizztdourden08/tessera/primitives';
import { LadderPreview } from '../LadderPreview';
import { OptionValueTag } from '../OptionValueTag';
import { OptionDescription } from '../OptionDescription';
import { PondAskControls } from './sub-components/PondAskControls';
import { PondOptionLine } from './sub-components/PondOptionLine';
import { PondPriceControls } from './sub-components/PondPriceControls';
import type { PondRowState, WishingPondRowProps } from './WishingPondRow.type';
import './WishingPondRow.css';

const itemsLabel = (count: number): string =>
  (count === 0 ? 'none, not a check' : `${count} item${count === 1 ? '' : 's'}`);

const WishingPondRow = (props: WishingPondRowProps) => {
  const { model, readOnly = false, readout = false, onChange } = props;
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
          <PondAskControls model={model} readOnly={readOnly} readout={readout} onChange={patch} />
          {hasPrices && <PondPriceControls model={model} readOnly={readOnly} readout={readout} onChange={patch} />}
          <PondOptionLine label="pool items in the pond">
            {readout ? <OptionValueTag value={itemsLabel(Math.min(state.items, maxItems))} /> : (
              <Slider
                value={Math.min(state.items, maxItems)}
                min={0}
                max={maxItems}
                step={1}
                disabled={readOnly}
                formatValue={itemsLabel}
                onChange={(items) => patch({ items })}
              />
            )}
          </PondOptionLine>
        </Box>
      )}
      <Box className="pond-row__preview">
        <Text tone="faint" className="pond-row__preview-title">throw prices</Text>
        <LadderPreview {...preview} />
      </Box>
      {walletNote !== undefined && <Text className="pond-row__footnote">{walletNote}</Text>}
    </Box>
  );
};

export { WishingPondRow };
