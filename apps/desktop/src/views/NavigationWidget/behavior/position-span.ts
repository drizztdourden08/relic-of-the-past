/* @layer renderer-widgets @kind logic */
import type { PositionSpan } from '../NavigationWidget.type';

const positionSpan = (positions: readonly number[]): PositionSpan => {
  const first = positions[0];
  const last = positions[positions.length - 1];
  if (first === undefined || last === undefined) throw new Error('connection has no positions');
  return { first, last };
};

export { positionSpan };
