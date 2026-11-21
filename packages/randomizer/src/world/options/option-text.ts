/* @layer shared-game @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { optionTextHolder } from './option-text-holder';

const optionText = (text: Text): string => optionTextHolder.resolve(text);

export { optionText };
