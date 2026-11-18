/* @layer shared-game @kind logic */
import { optionTextHolder } from './option-text-holder';
import type { OptionTextResolver } from './option-text.type';

const setOptionTextResolver = (next: OptionTextResolver): void => {
  optionTextHolder.resolve = next;
};

export { setOptionTextResolver };
