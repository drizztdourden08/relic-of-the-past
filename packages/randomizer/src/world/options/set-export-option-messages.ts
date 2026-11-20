/* @layer shared-game @kind logic */
import { exportOptionTextHolder } from './export-option-text-holder';
import { NAMESPACE_PREFIXES } from './set-export-option-messages.constants';

const bareKeyOf = (key: string): string => {
  const prefix = NAMESPACE_PREFIXES.find((candidate) => key.startsWith(candidate));
  return prefix === undefined ? key : key.slice(prefix.length);
};

const setExportOptionMessages = (english: Readonly<Record<string, string>>): void => {
  exportOptionTextHolder.resolve = (text) => {
    if (typeof text === 'string') return text;
    return english[bareKeyOf(text.key)] ?? text.key;
  };
};

export { setExportOptionMessages };
