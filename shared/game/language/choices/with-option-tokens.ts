/* @layer shared-game @kind logic */
import type { Token } from '../types';
import type { ChoiceShape } from './types';

const withOptionTokens = (shape: ChoiceShape, index: number, tokens: Token[]): ChoiceShape => ({
  ...shape,
  options: shape.options.map((option, i) => (i === index ? { ...option, tokens } : option)),
});

export { withOptionTokens };
