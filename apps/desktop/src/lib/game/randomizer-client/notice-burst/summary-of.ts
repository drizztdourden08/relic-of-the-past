/* @layer bridge-wasm @kind logic */
import { noticeOf, playerPart } from '../online-notices';
import type { NoticePart, OnlineNotice } from '../online-notices';
import { SUMMARY_TEXT } from './notice-burst.constants';

const summaryOf = (notice: OnlineNotice, count: number): OnlineNotice => {
  const { kind, counterpart } = notice;
  const [toPlayer, alone] = SUMMARY_TEXT[kind];
  const parts: NoticePart[] = counterpart && toPlayer !== alone
    ? [{ text: `${count}${toPlayer}` }, playerPart(counterpart)]
    : [{ text: `${count}${alone}` }];
  return noticeOf(kind, parts, counterpart);
};

export { summaryOf };
