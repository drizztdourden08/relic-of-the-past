/* @layer renderer-components @kind logic */
import { codeInfoFor } from '@rotp/languages';
import type { Token } from '@rotp/languages';
import { NAME_CODE, NUMBER_CODE, PAUSE_CODE, WAIT_BUTTON_CODE } from './entry.constants';
import { tallyTokens } from './tally-tokens';

const wording = (name: string, fallback: string): string => {
  const label = codeInfoFor(name)?.label ?? fallback;
  return label.charAt(0).toLowerCase() + label.slice(1);
};

const countTail = (n: number, label: string): string => `${n} ${label}${n === 1 ? '' : 's'}`;

const countHead = (n: number, label: string): string => {
  const [head, ...rest] = label.split(' ');
  const plural = `${head}${n === 1 ? '' : 's'}`;
  return rest.length ? `${n} ${plural} ${rest.join(' ')}` : `${n} ${plural}`;
};

const summarizeEntry = (tokens: Token[]): string[] => {
  const { insertsName, digits, terms, waits, pauses } = tallyTokens(tokens);
  const phrases: string[] = [];

  if (insertsName) phrases.push(`the ${wording(NAME_CODE, "player's name")}`);
  if (digits > 0) phrases.push(countTail(digits, wording(NUMBER_CODE, 'number digit')));
  if (terms.length > 0) phrases.push(`${terms.length === 1 ? 'term' : 'terms'} ${terms.join(', ')}`);
  if (waits > 0) phrases.push(countHead(waits, wording(WAIT_BUTTON_CODE, 'wait for button')));
  if (pauses > 0) phrases.push(countTail(pauses, wording(PAUSE_CODE, 'pause')));

  return phrases;
};

export { summarizeEntry };
