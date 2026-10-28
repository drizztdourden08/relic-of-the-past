/* @layer website-site @kind logic */
import type { CSSProperties } from 'react';
import { WRAP_SLACK } from '../CloudStage.constants';
import type { CloudPlacement } from '../CloudStage.type';

const wordStyleOf = ({ rect, fontPx }: CloudPlacement): CSSProperties =>
  ({ '--cloud-x': `${rect.left}px`, '--cloud-y': `${rect.top}px`, '--cloud-font': `${fontPx}px`, '--cloud-w': `${rect.width * WRAP_SLACK}px` }) as CSSProperties;

export { wordStyleOf };
