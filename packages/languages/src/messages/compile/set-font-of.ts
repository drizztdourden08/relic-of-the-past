/* @layer shared-game @kind logic */
import type { SetBakeInput, SetFont } from './compile.type';

const setFontOf = ({ fontData, fontWidth }: SetBakeInput): SetFont => ({
  fontData: Buffer.from(fontData),
  fontWidth: Buffer.from(fontWidth),
});

export { setFontOf };
