/* @layer renderer-components @kind logic */
/**
 * Pure token-stream summary for the read-only entry card: the short "what is in
 * this line" phrases a translator needs before opening it — a name
 * substitution, runtime digits, glossary references, and the stops the player
 * has to press through.
 *
 * Wording comes from the control-code catalog rather than from the bracket
 * names in the stream, so the card says "2 waits for button" where the stored
 * text says `[Waitkey]`. Nothing here reads state or measures anything: tokens
 * in, phrases out.
 */
import { codeInfoFor } from '@shared/game/language';
import type { Token } from '@shared/game/language';

/** Catalog names for the codes worth calling out on a card. */
const NAME_CODE = 'Name';
const NUMBER_CODE = 'Number';
const WAIT_BUTTON_CODE = 'Waitkey';
const PAUSE_CODE = 'Wait';

/** What one entry's stream carries, before any of it is put into words. */
type EntryTally = {
  insertsName: boolean;
  digits: number;
  terms: string[];
  waits: number;
  pauses: number;
};

/** The catalog's own label, recased to sit mid-sentence, with a written fallback. */
const wording = (name: string, fallback: string): string => {
  const label = codeInfoFor(name)?.label ?? fallback;
  return label.charAt(0).toLowerCase() + label.slice(1);
};

/** Head-final label ("number digit" -> "2 number digits"). */
const countTail = (n: number, label: string): string => `${n} ${label}${n === 1 ? '' : 's'}`;

/** Head-first label ("wait for button" -> "2 waits for button"). */
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

/**
 * The card's "contains" phrases, in reading order. Empty when the stream holds
 * nothing worth mentioning, so the caller can drop the line entirely rather
 * than print a header with nothing after it.
 */
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
export type { EntryTally };
