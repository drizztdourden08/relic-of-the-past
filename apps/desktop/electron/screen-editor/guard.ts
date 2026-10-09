/* @layer electron-main @kind logic */
import { refusal } from './refusal';
import type { Refusal } from './refusal.type';
import { getWorkspaceRoot } from './workspace-root';

const guard = async <A, R>(write: (root: string, args: A) => Promise<R>, args: A): Promise<R | Refusal> => {
  try {
    return await write(getWorkspaceRoot(), args);
  } catch (e: unknown) {
    return refusal(e);
  }
};

export { guard };
