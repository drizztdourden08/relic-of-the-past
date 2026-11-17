/* @layer renderer-components @kind logic */
import { PROBLEMS } from '../MsuCreateWizard.constants';
import type { MsuWizardValues } from '../MsuCreateWizard.type';
import { isWebAddress } from '../../../is-web-address';

const nameProblem = (values: MsuWizardValues, isTaken: (name: string) => boolean): string | null => {
  const name = values.name.trim();
  if (name === '') return PROBLEMS.noName;
  return isTaken(name) ? PROBLEMS.taken : null;
};

const urlProblem = (url: string): string | null => {
  const trimmed = url.trim();
  if (trimmed === '') return PROBLEMS.noUrl;
  return isWebAddress(trimmed) ? null : PROBLEMS.badUrl;
};

const detailsProblem = (values: MsuWizardValues, isTaken: (name: string) => boolean): string | null => {
  const name = nameProblem(values, isTaken);
  if (name !== null) return name;
  if (values.source === 'file') return values.file === null ? PROBLEMS.noFile : null;
  if (values.source === 'url') return urlProblem(values.url);
  return null;
};

export { detailsProblem };
