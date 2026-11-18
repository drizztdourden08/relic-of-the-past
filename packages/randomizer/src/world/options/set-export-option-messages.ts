/* @layer shared-game @kind logic */
import { exportOptionTextHolder } from './export-option-text-holder';

const NAMESPACE_PREFIX = 'randomizer:';

const setExportOptionMessages = (english: Readonly<Record<string, string>>): void => {
  exportOptionTextHolder.resolve = (text) => {
    if (typeof text === 'string') return text;
    const bare = text.key.startsWith(NAMESPACE_PREFIX) ? text.key.slice(NAMESPACE_PREFIX.length) : text.key;
    return english[bare] ?? text.key;
  };
};

export { setExportOptionMessages };
