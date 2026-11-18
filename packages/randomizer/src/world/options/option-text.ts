/* @layer shared-game @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';

type OptionTextResolver = (text: Text) => string;

const keyOf: OptionTextResolver = (text) => (typeof text === 'string' ? text : text.key);

let resolver: OptionTextResolver = keyOf;

const setOptionTextResolver = (next: OptionTextResolver): void => {
  resolver = next;
};

const optionText = (text: Text): string => resolver(text);

export { optionText, setOptionTextResolver };
