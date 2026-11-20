/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { BottleContentRow, CurrencyPriceRow } from '../../CurrencyPriceRow';
import { askWithBottleTick } from '../behavior/ask-with-bottle-tick';
import { askWithContent } from '../behavior/ask-with-content';
import { askWithCurrencyTick } from '../behavior/ask-with-currency-tick';
import { askWithItemTick } from '../behavior/ask-with-item-tick';
import { askWithRange } from '../behavior/ask-with-range';
import type { PondControlsProps } from '../WishingPondRow.type';

const PondAskControls = (props: PondControlsProps) => {
  const t = useT();
  const { model, readOnly, readout = false, onChange } = props;
  const { askModel, state } = model;
  const { ask } = state;
  const edit = readOnly ? undefined : onChange;

  return (
    <>
      <Text className="pond-row__group-caption">{t('compounds:wishing-pond-row.may-ask-for')}</Text>
      {askModel.counted.map((row) => (
        <CurrencyPriceRow
          key={row.currency}
          label={row.label}
          enabled={row.checked}
          stops={row.stops}
          range={row.range}
          readout={readout}
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
        label={t('compounds:wishing-pond-row.a-bottle-of-something')}
        enabled={askModel.bottleChecked}
        stops={askModel.bottleStops}
        range={askModel.bottleRange}
        readout={readout}
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
            readout={readout}
            onChange={edit === undefined
              ? undefined
              : (next) => edit({ ask: askWithContent(ask, row.content, next) })}
          />
        ))}
      </CurrencyPriceRow>
      <CurrencyPriceRow
        label={t('compounds:wishing-pond-row.an-item-held-up-and')}
        enabled={askModel.itemChecked}
        readout={readout}
        onEnabledChange={edit === undefined ? undefined : (next) => edit({ ask: askWithItemTick(ask, next) })}
      />
    </>
  );
};

export { PondAskControls };
