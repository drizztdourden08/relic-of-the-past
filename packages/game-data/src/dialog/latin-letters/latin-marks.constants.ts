/* @layer shared-game @kind data */
import type { MarkArt } from './latin-letters.type';

const LATIN_MARKS: Readonly<Record<string, MarkArt>> = {
  grave: { place: 'above', rows: ['# ', ' #'] },
  acute: { place: 'above', rows: [' #', '# '] },
  circumflex: { place: 'above', rows: [' # ', '# #'] },
  caron: { place: 'above', rows: ['# #', ' # '] },
  breve: { place: 'above', rows: ['#  #', ' ## '] },
  invertedBreve: { place: 'above', rows: [' ## ', '#  #'] },
  tilde: { place: 'above', rows: [' ## #', '#  # '], compact: [' # #', '# # '] },
  macron: { place: 'above', rows: ['####'], compact: ['###'] },
  diaeresis: { place: 'above', rows: ['# #'] },
  dot: { place: 'above', rows: ['#'] },
  hook: { place: 'above', rows: ['##', ' #', '# '], compact: ['##', ' #'] },
  ring: { place: 'above', rows: ['###', '# #', '###'], compact: ['##', '##'] },
  doubleAcute: { place: 'above', rows: [' # #', '# # '] },
  doubleGrave: { place: 'above', rows: ['# # ', ' # #'] },
  turnedComma: { place: 'above', rows: [' #', '# '] },
  dotBelow: { place: 'below', rows: ['#'] },
  diaeresisBelow: { place: 'below', rows: ['# #'] },
  ringBelow: { place: 'below', rows: ['##', '##'] },
  commaBelow: { place: 'below', rows: [' #', '# '] },
  circumflexBelow: { place: 'below', rows: [' # ', '# #'] },
  breveBelow: { place: 'below', rows: ['#  #', ' ## '] },
  tildeBelow: { place: 'below', rows: [' ## #', '#  # '] },
  macronBelow: { place: 'below', rows: ['####'], compact: ['###'] },
  cedilla: { place: 'attached', rows: ['# ', ' #', '# '] },
  ogonek: { place: 'ogonek', rows: [' #', '# ', ' ##'] },
};

export { LATIN_MARKS };
