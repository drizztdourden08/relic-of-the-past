/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { nearestStopIndex } from '@rotp/game-data';
import { IndexSlider } from '../IndexSlider';
import type { StopSliderInput } from '../IndexSlider.type';

const stopAt = (stops: readonly number[], index: number): number =>
  stops[Math.min(stops.length - 1, Math.max(0, Math.round(index)))] ?? 0;

const stopSlider = (input: StopSliderInput): ReactNode => {
  const { settingKey, stops, value, format, onStop, disabled } = input;
  return createElement(IndexSlider, {
    settingKey,
    index: nearestStopIndex(stops, value),
    count: stops.length,
    formatIndex: (index: number) => format(stopAt(stops, index)),
    onIndex: (index: number) => onStop(stopAt(stops, index)),
    disabled,
  });
};

export { stopSlider };
