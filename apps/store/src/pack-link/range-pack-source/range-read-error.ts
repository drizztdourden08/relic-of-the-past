/* @layer store-site @kind logic */
import { READ_FAILED } from './range-pack-source.constants';

class RangeReadError extends Error {
  readonly status: number | null;

  constructor(status: number | null) {
    super(READ_FAILED);
    this.status = status;
  }
}

export { RangeReadError };
