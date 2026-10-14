/* @layer shared-hud @kind logic */
import type { Issues } from './validate-box.type';

const reportMissing = (raw: unknown, message: string, issues: Issues): undefined => {
  if (raw === undefined) issues.push(message);
  return undefined;
};

export { reportMissing };
