/* @layer website-site @kind logic */
import type { CloudTriangle } from '../CloudStage.type';

const trianglesOf = (width: number, height: number): CloudTriangle[] => [
  { centerX: width / 2, top: 0, height: height / 2, half: width / 4 },
  { centerX: width / 4, top: height / 2, height: height / 2, half: width / 4 },
  { centerX: (width * 3) / 4, top: height / 2, height: height / 2, half: width / 4 },
];

export { trianglesOf };
