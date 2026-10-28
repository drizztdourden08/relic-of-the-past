/* @layer website-site @kind logic */
import { FONT_TOKENS } from '../CloudStage.constants';
import type { CloudFontRange } from '../CloudStage.type';

const fontRangeOf = (stage: HTMLElement, stageWidth: number): CloudFontRange => {
  const style = getComputedStyle(stage);
  const pxOf = (token: string): number => (parseFloat(style.getPropertyValue(token)) / 100) * stageWidth;

  return { min: pxOf(FONT_TOKENS.min), max: pxOf(FONT_TOKENS.max) };
};

export { fontRangeOf };
