/* @layer tests @kind helper */
import { SMC_HEADER_SIZE } from './rom-fixture.constants';

const bodyOf = (bytes: Buffer): Buffer =>
  (bytes.length & 0xfffff) === SMC_HEADER_SIZE ? bytes.subarray(SMC_HEADER_SIZE) : bytes;

export { bodyOf };
