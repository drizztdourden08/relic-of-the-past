/* @layer renderer-components @kind logic */
import { codeInfoFor } from '@rotp/languages';
import type { Token } from '@rotp/languages';
import { NAME_CODE, NUMBER_CODE, PAUSE_CODE, WAIT_BUTTON_CODE } from './entry.constants';
import type { EntryTally } from './entry.type';

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

const tally = (tokens: Token[]): EntryTally => {
  const terms: string[] = [];
  let insertsName = false;
  let digits = 0;
  let waits = 0;
  let pauses = 0;

  for (const token of tokens) {
    if (token.t === 'var' && token.name === 'player-name') insertsName = true;
    else if (token.t === 'var' && token.name === 'number') digits += 1;
    else if (token.t === 'ref' && !terms.includes(token.key)) terms.push(token.key);
    else if (token.t === 'cmd' && token.name === WAIT_BUTTON_CODE) waits += 1;
    else if (token.t === 'cmd' && token.name === PAUSE_CODE) pauses += 1;
  }

  return { insertsName, digits, terms, waits, pauses };
};

const summarizeEntry = (tokens: Token[]): string[] => {
  const { insertsName, digits, terms, waits, pauses } = tally(tokens);
  const phrases: string[] = [];

  if (insertsName) phrases.push(`the ${wording(NAME_CODE, "player's name")}`);
  if (digits > 0) phrases.push(countTail(digits, wording(NUMBER_CODE, 'number digit')));
  if (terms.length > 0) phrases.push(`${terms.length === 1 ? 'term' : 'terms'} ${terms.join(', ')}`);
  if (waits > 0) phrases.push(countHead(waits, wording(WAIT_BUTTON_CODE, 'wait for button')));
  if (pauses > 0) phrases.push(countTail(pauses, wording(PAUSE_CODE, 'pause')));

  return phrases;
};

export { summarizeEntry };
