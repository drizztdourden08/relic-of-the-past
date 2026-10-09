/* @layer shared-hud @kind logic */
import { COMMENT_KEY } from './validate-box.constants';
import type { Issues } from './validate-box.type';

const checkKeys = (value: Record<string, unknown>, allowed: readonly string[], path: string, issues: Issues): void => {
  Object.keys(value).forEach((key) => {
    if (key === COMMENT_KEY || allowed.includes(key)) return;
    issues.push(`${path}: unknown key '${key}'`);
  });
};

export { checkKeys };
