/* @layer renderer-other @kind hook */
import { useMemo } from 'react';
import { useTesseraLocale, useTesseraStrings } from '@drizztdourden08/tessera/primitives';
import type { DateFormatOptions } from '@drizztdourden08/tessera/primitives';

const useDateFormatOptions = (): DateFormatOptions => {
  const { dates } = useTesseraStrings();
  const locale = useTesseraLocale();
  return useMemo(() => ({ strings: dates, locale }), [dates, locale]);
};

export { useDateFormatOptions };
