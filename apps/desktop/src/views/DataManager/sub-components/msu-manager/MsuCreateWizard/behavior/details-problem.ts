/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { problems } from '../MsuCreateWizard.constants';
import type { MsuWizardValues } from '../MsuCreateWizard.type';
import { isWebAddress } from '../../../is-web-address';

const nameProblem = (values: MsuWizardValues, isTaken: (name: string) => boolean, t: I18n['t']): string | null => {
  const name = values.name.trim();
  if (name === '') return problems(t).noName;
  return isTaken(name) ? problems(t).taken : null;
};

const urlProblem = (url: string, t: I18n['t']): string | null => {
  const trimmed = url.trim();
  if (trimmed === '') return problems(t).noUrl;
  return isWebAddress(trimmed) ? null : problems(t).badUrl;
};

const detailsProblem = (values: MsuWizardValues, isTaken: (name: string) => boolean, t: I18n['t']): string | null => {
  const name = nameProblem(values, isTaken, t);
  if (name !== null) return name;
  if (values.source === 'file') return values.file === null ? problems(t).noFile : null;
  if (values.source === 'url') return urlProblem(values.url, t);
  return null;
};

export { detailsProblem };
