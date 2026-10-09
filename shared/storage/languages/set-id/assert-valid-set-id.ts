/* @layer shared-storage @kind logic */
import { SET_ID_RE } from './set-id.constants';

const assertValidSetId = (id: string): void => {
  if (!SET_ID_RE.test(id)) {
    throw new Error(
      `Invalid language set id "${id}": use lowercase letters, digits and dashes only `
      + '(e.g. "de" or "de-community").',
    );
  }
};

export { assertValidSetId };
