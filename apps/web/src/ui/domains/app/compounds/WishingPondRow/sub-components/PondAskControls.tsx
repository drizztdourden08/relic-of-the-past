/* @layer renderer-components @kind component */
/**
 * What she may ask for: one row per demand a rung can carry, drawn with the
 * same row the shop prices use (CurrencyPriceRow), so a demand and a shelf
 * price read alike wherever the player meets them.
 *
 * The rows go straight onto the block's own grid, so each one lays its tick in
 * the label track and its range beside it and costs ONE line, and the caption
 * over them takes the whole width as the group's title.
 *
 * Rupees, bombs and arrows carry a two-thumb range; the rupee one IS the
 * pond's price ladder, so moving it moves the ladder and the preview under it.
 * The bottle row counts as well, over how many bottles she may name, and keeps
 * its contents on the line under its range. The item row is a tick on its own,
 * because what she asks to see is one item and no amount of it.
 */
import { Text } from '@ds/primitives';
import { BottleContentRow, CurrencyPriceRow } from '../../CurrencyPriceRow';
import {
  askWithBottleTick, askWithContent, askWithCurrencyTick, askWithItemTick, askWithRange,
} from '../behavior/ask-edits';
import type { PondRowModel, PondRowState } from '../WishingPondRow.type';

interface PondAskControlsProps {
  model: PondRowModel;
  readOnly: boolean;
  onChange: (part: Partial<PondRowState>) => void;
}

const PondAskControls = (props: PondAskControlsProps) => {
  const { model, readOnly, onChange } = props;
  const { askModel, state } = model;
  const { ask } = state;
  const edit = readOnly ? undefined : onChange;

  return (
    <>
      <Text className="pond-row__group-caption">what she may ask for</Text>
      {askModel.counted.map((row) => (
        <CurrencyPriceRow
          key={row.currency}
          label={row.label}
          enabled={row.checked}
          stops={row.stops}
          range={row.range}
          onEnabledChange={edit === undefined
            ? undefined
            : (next) => edit({ ask: askWithCurrencyTick(ask, row.currency, next) })}
          onRangeChange={edit === undefined || row.stops === undefined
            ? undefined
            : (next) => edit(row.currency === 'rupees'
              ? { range: next }
              : { ask: askWithRange(ask, row.currency, row.stops ?? [], next) })}
        />
      ))}
      <CurrencyPriceRow
        label="A bottle of something"
        enabled={askModel.bottleChecked}
        stops={askModel.bottleStops}
        range={askModel.bottleRange}
        onEnabledChange={edit === undefined ? undefined : (next) => edit({ ask: askWithBottleTick(ask, next) })}
        onRangeChange={edit === undefined
          ? undefined
          : (next) => edit({ ask: askWithRange(ask, 'bottle', askModel.bottleStops, next) })}
      >
        {askModel.bottleRows.map((row) => (
          <BottleContentRow
            key={row.content}
            row={{ ...row, key: row.content, blocked: false, note: '' }}
            disabled={!askModel.bottleChecked}
            onChange={edit === undefined
              ? undefined
              : (next) => edit({ ask: askWithContent(ask, row.content, next) })}
          />
        ))}
      </CurrencyPriceRow>
      <CurrencyPriceRow
        label="An item, held up and handed back"
        enabled={askModel.itemChecked}
        onEnabledChange={edit === undefined ? undefined : (next) => edit({ ask: askWithItemTick(ask, next) })}
      />
    </>
  );
};

export { PondAskControls };
export type { PondAskControlsProps };
