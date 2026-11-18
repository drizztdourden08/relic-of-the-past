/* @layer renderer-app @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { TextOf } from './settings-controls.type';

const textOptions = <T extends { label: Text }>(options: readonly T[], text: TextOf): (Omit<T, 'label'> & { label: string })[] =>
  options.map((option) => ({ ...option, label: text(option.label) }));

export { textOptions };
