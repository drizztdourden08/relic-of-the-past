/* @layer renderer-lib @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';

const failureLine = (text: Text): string => (typeof text === 'string' ? text : text.key);

export { failureLine };
