/* @layer tests @kind helper */
import { describe, it } from 'vitest';
import { hasDataset } from './has-dataset';

const emptyDatasetPlaceholder = (name: string): void => {
  describe.skip(name, () => {
    it('needs the record dataset, which seeded empty', () => undefined);
  });
};

const describeDataset = (hasDataset() ? describe : emptyDatasetPlaceholder) as typeof describe;

export { describeDataset };
