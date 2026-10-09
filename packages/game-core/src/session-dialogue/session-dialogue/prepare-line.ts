/* @layer bridge-wasm @kind logic */
import { isChoiceLine, isPageLine, receiptLineCandidates } from '../../receipt-text/receipt-line.type';
import { choiceMessageText } from '../choice-message';
import { toDialogueText } from '../dialogue-text';
import { pageMessageText } from '../page-message';
import { fitReceiptLine, wrapMessageText } from '../wrap-message';
import type { DialogueCharset } from '@rotp/game-data';
import type { ReceiptLine } from '../../receipt-text/receipt-line.type';

const prepareLine = (line: ReceiptLine, charset: DialogueCharset): string => {
  const candidates = receiptLineCandidates(line).map((text) => toDialogueText(text, charset));
  if (isChoiceLine(line)) return choiceMessageText(line, candidates, charset);
  if (isPageLine(line)) return pageMessageText(candidates, charset);
  const { alphabet, widths } = charset;
  return wrapMessageText(fitReceiptLine(candidates, alphabet, widths), alphabet, widths);
};

export { prepareLine };
