/* @layer website-site @kind logic */
import type { Screenshot } from '../../../features';

const aspectOf = (shot: Screenshot): number => shot.width / shot.height;

export { aspectOf };
