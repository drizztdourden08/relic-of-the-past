/* @layer shared-game @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { exportOptionTextHolder } from './export-option-text-holder';

const exportOptionText = (text: Text): string => exportOptionTextHolder.resolve(text);

export { exportOptionText };
