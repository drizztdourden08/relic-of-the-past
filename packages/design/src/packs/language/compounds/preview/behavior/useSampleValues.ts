/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { MAX_NAME_GLYPHS, NUMBER_KEY, PLAYER_NAME_KEY } from '@rotp/languages';
import { engineSample } from './engine-sample';

const useSampleValues = () => {
  const [nameSample, setNameSample] = useState<string>(() => engineSample(PLAYER_NAME_KEY));
  const [digit, setDigit] = useState<string>(() => engineSample(NUMBER_KEY));

  const opts = useMemo(() => ({ nameSample, numberDigit: digit }), [nameSample, digit]);

  const handleName = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setNameSample(event.currentTarget.value.slice(0, MAX_NAME_GLYPHS));
  }, []);

  const handleDigit = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const last = event.currentTarget.value.slice(-1);
    setDigit(/^\d$/.test(last) ? last : '');
  }, []);

  return { opts, nameSample, digit, handleName, handleDigit };
};

export { useSampleValues };
